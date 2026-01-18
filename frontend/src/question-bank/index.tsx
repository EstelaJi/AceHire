import { useState, useEffect } from 'react';
import { Select, Card, Tag, Button, Modal, Form, Input, message } from 'antd';
import { Filter, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Question, fallbackQuestions, fetchQuestions, addQuestion } from '../home/questionsData';

export default function QuestionBankPage() {
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Fetch questions from API on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchQuestions();
        // Fallback to hardcoded questions if API returns empty
        setAllQuestions(fetchedQuestions.length > 0 ? fetchedQuestions : fallbackQuestions);
      } catch (error) {
        console.error('Failed to load questions:', error);
        setAllQuestions(fallbackQuestions);
      }
    };
    loadQuestions();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...allQuestions];
    
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(q => q.level === selectedLevel);
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(q => q.type === selectedType);
    }
    
    setFilteredQuestions(filtered);
  }, [selectedLevel, selectedType, allQuestions]);

  // Handle adding new question
  const handleAddQuestion = async (values: any) => {
    try {
      const newQuestion = await addQuestion(values);
      setAllQuestions([newQuestion, ...allQuestions]);
      setIsModalOpen(false);
      form.resetFields();
      message.success('Question added successfully!');
    } catch (error) {
      message.error('Failed to add question');
    }
  };

  const showAddModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'easy': return 'green';
      case 'medium': return 'gold';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'behavior': return 'blue';
      case 'technical': return 'purple';
      case 'product': return 'orange';
      case 'system design': return 'cyan';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button type="text" icon={<ArrowLeft />}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Back to Home</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-balance">
            Question Bank
          </h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2">
              <Filter className="size-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Filter by:</span>
            </div>
            <Select
              placeholder="Select Level"
              value={selectedLevel}
              onChange={setSelectedLevel}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: 'All Levels' },
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' }
              ]}
            />
            <Select
              placeholder="Select Type"
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: 180 }}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'behavior', label: 'Behavior' },
                { value: 'technical', label: 'Technical' },
                { value: 'product', label: 'Product' },
                { value: 'system design', label: 'System Design' }
              ]}
            />
            <Button type="primary" icon={<Plus />} onClick={showAddModal}>
              Add Question
            </Button>
          </div>

          {/* Questions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map((question) => (
              <Link key={question.id} to={`/question-bank/${question.id}`} style={{ textDecoration: 'none' }}>
                <Card className="h-full cursor-pointer hover:shadow-lg transition-shadow duration-200">
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2 flex-wrap">
                      <Tag color={getLevelColor(question.level)}>{question.level}</Tag>
                      <Tag color={getTypeColor(question.type)}>{question.type}</Tag>
                    </div>
                    <p className="text-foreground leading-relaxed">{question.question}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No questions found matching your filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Question Modal */}
      <Modal
        title="Add New Question"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddQuestion}
          initialValues={{
            level: 'easy',
            type: 'behavior'
          }}
        >
          <Form.Item
            name="question"
            label="Question"
            rules={[{ required: true, message: 'Please enter the question' }]}
          >
            <Input.TextArea rows={2} placeholder="Enter the interview question" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="level"
              label="Level"
              rules={[{ required: true, message: 'Please select level' }]}
            >
              <Select>
                <Select.Option value="easy">Easy</Select.Option>
                <Select.Option value="medium">Medium</Select.Option>
                <Select.Option value="hard">Hard</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: 'Please select type' }]}
            >
              <Select>
                <Select.Option value="behavior">Behavior</Select.Option>
                <Select.Option value="technical">Technical</Select.Option>
                <Select.Option value="product">Product</Select.Option>
                <Select.Option value="system design">System Design</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="industry" label="Industry">
            <Input placeholder="e.g., software, product" />
          </Form.Item>

          <Form.Item
            name="explanation"
            label="Explanation"
            rules={[{ required: true, message: 'Please enter explanation' }]}
          >
            <Input.TextArea rows={3} placeholder="Explain what this question assesses" />
          </Form.Item>

          <Form.Item
            name="examples"
            label="Example Answers"
            rules={[{ required: true, message: 'Please enter example answers' }]}
            getValueProps={(value) => ({ value: Array.isArray(value) ? value : [] })}
            valuePropName="value"
          >
            <Select mode="tags" placeholder="Enter example answers (press Enter to add)" />
          </Form.Item>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Add Question
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}