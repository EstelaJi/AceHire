import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { initDatabase } from '../connection';
import { questionRepository } from '../repositories/QuestionRepository';

interface QuestionData {
  id: string;
  question: string;
  level: 'easy' | 'medium' | 'hard';
  type: 'behavior' | 'technical' | 'product' | 'system design';
  industry?: string;
  explanation: string;
  examples: string[];
}

function parseQuestionsFile(filePath: string): QuestionData[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const sourceFile = ts.createSourceFile(
    'questionsData.ts',
    content,
    ts.ScriptTarget.Latest,
    true
  );

  let questions: QuestionData[] = [];

  function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      const declaration = node.declarationList.declarations[0];
      if (declaration.name.getText() === 'questions' && declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) {
        const arrayLiteral = declaration.initializer;
        
        arrayLiteral.elements.forEach((element) => {
          if (ts.isObjectLiteralExpression(element)) {
            const questionObj: Record<string, any> = {};
            
            element.properties.forEach((prop) => {
              if (ts.isPropertyAssignment(prop)) {
                const propName = prop.name.getText();
                let propValue: any;
                
                if (ts.isStringLiteral(prop.initializer)) {
                  propValue = prop.initializer.text;
                } else if (ts.isArrayLiteralExpression(prop.initializer)) {
                  propValue = prop.initializer.elements
                    .filter(el => ts.isStringLiteral(el))
                    .map(el => (el as ts.StringLiteral).text);
                } else {
                  propValue = prop.initializer.getText();
                }
                
                questionObj[propName] = propValue;
              }
            });
            
            questions.push(questionObj as QuestionData);
          }
        });
      }
    }
    
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  
  return questions;
}

export async function importQuestionsFromFile() {
  console.log('\n📦 Starting database import from frontend file...\n');

  try {
    const frontendFilePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'frontend',
      'src',
      'home',
      'questionsData.ts'
    );

    console.log(`📂 Reading from: ${frontendFilePath}\n`);

    if (!fs.existsSync(frontendFilePath)) {
      throw new Error(`File not found: ${frontendFilePath}`);
    }

    const questionsData = parseQuestionsFile(frontendFilePath);
    console.log(`✅ Parsed ${questionsData.length} questions from file\n`);

    await initDatabase();

    const existingCount = await questionRepository.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing questions`);
      console.log('ℹ️  Clearing existing data...');
      await questionRepository.clear();
      console.log('✅ Existing data cleared\n');
    }

    console.log(`📝 Importing ${questionsData.length} questions to database...\n`);

    const questionsToCreate = questionsData.map(q => ({
      question_text: q.question,
      level: q.level,
      type: q.type,
      industry: q.industry,
      explanation: q.explanation,
      examples: q.examples,
    }));

    for (let i = 0; i < questionsToCreate.length; i++) {
      await questionRepository.create(questionsToCreate[i]);
      if ((i + 1) % 5 === 0 || i + 1 === questionsToCreate.length) {
        process.stdout.write(`\r⏳ Progress: ${i + 1}/${questionsToCreate.length}`);
      }
    }

    console.log('\n');

    const finalCount = await questionRepository.count();
    console.log('\n✅ Database import completed successfully!');
    console.log(`📊 Total questions in database: ${finalCount}\n`);

  } catch (error) {
    console.error('\n❌ Error importing to database:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

if (require.main === module) {
  importQuestionsFromFile();
}
