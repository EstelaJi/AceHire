import { useState } from 'react';
import { Form, Input, Select, Button, Card, message } from 'antd';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createQuestion, CreateQuestionInput } from '../api/questions';

const { TextArea } = Input;

export default function AddQuestionPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (values: CreateQuestionInput) => {
    try {
      setLoading(true);
      await createQuestion(values);
      message.success('Question added successfully!');
      form.resetFields();
      navigate('/question-bank');
    } catch (error) {
      console.error('Failed to create question:', error);
      message.error('Failed to create question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button type="text" icon={<ArrowLeft />}>
            <Link to="/question-bank" style={{ color: 'inherit', textDecoration: 'none' }}>
              Back to Question Bank
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Plus className="size-6 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">Add New Question</h1>
              </div>
              <p className="text-muted-foreground">
                Fill in the details below to add a new interview question to the question bank.
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="Question"
                name="question"
                rules={[
                  { required: true, message: 'Please enter the question' },
                  { min: 10, message: 'Question must be at least 10 characters long' }
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Enter the interview question..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>

              <div className="grid md:grid-cols-2 gap-6">
                <Form.Item
                  label="Level"
                  name="level"
                  rules={[{ required: true, message: 'Please select a level' }]}
                >
                  <Select
                    placeholder="Select difficulty level"
                    options={[
                      { value: 'easy', label: 'Easy' },
                      { value: 'medium', label: 'Medium' },
                      { value: 'hard', label: 'Hard' }
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="Type"
                  name="type"
                  rules={[{ required: true, message: 'Please select a type' }]}
                >
                  <Select
                    placeholder="Select question type"
                    options={[
                      { value: 'behavior', label: 'Behavior' },
                      { value: 'technical', label: 'Technical' },
                      { value: 'product', label: 'Product' },
                      { value: 'system design', label: 'System Design' }
                    ]}
                  />
                </Form.Item>
              </div>

              <Form.Item
                label="Industry (Optional)"
                name="industry"
              >
                <Input
                  placeholder="e.g., software, product, finance..."
                  maxLength={50}
                />
              </Form.Item>

              <Form.Item
                label="Explanation"
                name="explanation"
                rules={[
                  { required: true, message: 'Please provide an explanation' },
                  { min: 20, message: 'Explanation must be at least 20 characters long' }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Explain what this question assesses and why it's important..."
                  maxLength={1000}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="Examples"
                name="examples"
                rules={[
                  { required: true, message: 'Please provide at least one example' },
                  {
                    validator: async (_, value) => {
                      if (!value || value.length === 0) {
                        throw new Error('Please provide at least one example');
                      }
                      if (value.some((ex: string) => ex.trim().length < 10)) {
                        throw new Error('Each example must be at least 10 characters long');
                      }
                    }
                  }
                ]}
              >
                <Select
                  mode="tags"
                  placeholder="Enter example answers and press Enter to add..."
                  tokenSeparators={[',', '\n']}
                  options={[]}
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                >
                  Add Question
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </main>
    </div>
  );
}
