import { Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useConfigStore } from '@/stores/configStore';

function App() {
  const { modifiedProperties } = useConfigStore();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Terminal className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Ghostty Config Editor</h1>
          </div>

          {/* Description */}
          <p className="text-center text-lg text-muted-foreground max-w-2xl">
            A modern desktop GUI editor for Ghostty terminal configuration files. Configure your
            terminal with an intuitive interface.
          </p>

          {/* Demo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Button Component</CardTitle>
                <CardDescription>Click to test the button</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full">Default Button</Button>
                <Button variant="secondary" className="w-full">
                  Secondary
                </Button>
                <Button variant="outline" className="w-full">
                  Outline
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Input Component</CardTitle>
                <CardDescription>Try typing in the input</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input placeholder="Enter value..." />
                <Input type="number" placeholder="Number input" />
                <Input type="email" placeholder="Email input" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>State Management</CardTitle>
                <CardDescription>Zustand store is active</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Modified properties: {modifiedProperties.size}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  State management is working correctly.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status */}
          <Card className="w-full max-w-4xl mt-4">
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
              <CardDescription>Phase 1: Foundation Setup Complete</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Tauri 2.x with React + TypeScript initialized</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Build tooling configured (ESLint, Prettier, TypeScript)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Tailwind CSS and shadcn/ui components installed</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Project structure organized (components, hooks, lib, stores, types)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Zustand state management configured</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
