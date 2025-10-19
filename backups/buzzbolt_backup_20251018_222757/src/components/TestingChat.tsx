import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Command, Terminal, Send, History, HelpCircle, X, CheckCircle, AlertCircle } from 'lucide-react';
import { commandParser, ParsedCommand } from '@/lib/testingCommands';
import { commandExecutor, CommandResult } from '@/lib/commandExecutor';

interface ChatMessage {
  id: string;
  type: 'user' | 'system' | 'error' | 'success';
  content: string;
  timestamp: Date;
  command?: ParsedCommand;
  result?: CommandResult;
}

interface AutoCompleteSuggestion {
  text: string;
  description: string;
  category: string;
}

const TestingChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<AutoCompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'system',
      content: '🧪 Testing Chat System Ready! Type /help for available commands.',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle input changes and auto-completion
  const handleInputChange = (value: string) => {
    setInput(value);
    
    if (value.trim().startsWith('/')) {
      const suggestions = commandParser.getAutoCompleteSuggestions(value);
      const suggestionObjects: AutoCompleteSuggestion[] = suggestions.map(suggestion => {
        const command = commandParser.getCommand(suggestion);
        return {
          text: suggestion,
          description: command?.description || '',
          category: command?.category || 'unknown'
        };
      });
      
      setSuggestions(suggestionObjects);
      setShowSuggestions(suggestionObjects.length > 0);
      setSelectedSuggestion(0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  // Handle command execution
  const executeCommand = async (commandInput: string) => {
    if (!commandInput.trim()) return;

    setIsExecuting(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: commandInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Parse command
      const parsedCommand = commandParser.parse(commandInput);
      
      if (!parsedCommand) {
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          type: 'error',
          content: `❌ Invalid command: ${commandInput}. Type /help for available commands.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      // Execute command
      const result = await commandExecutor.executeCommand(parsedCommand);
      
      const resultMessage: ChatMessage = {
        id: `result_${Date.now()}`,
        type: result.success ? 'success' : 'error',
        content: result.success ? `✅ ${result.message}` : `❌ ${result.message}`,
        timestamp: new Date(),
        command: parsedCommand,
        result
      };

      setMessages(prev => [...prev, resultMessage]);

      // Add to command history
      setCommandHistory(prev => {
        const newHistory = [...prev];
        if (!newHistory.includes(commandInput)) {
          newHistory.push(commandInput);
        }
        return newHistory.slice(-50); // Keep last 50 commands
      });

    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'error',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsExecuting(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isExecuting) {
      executeCommand(input.trim());
      setInput('');
      setShowSuggestions(false);
      setHistoryIndex(-1);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestion(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestion(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedSuggestion]) {
            setInput(suggestions[selectedSuggestion].text + ' ');
            setShowSuggestions(false);
            inputRef.current?.focus();
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          break;
      }
    } else if (e.key === 'ArrowUp' && commandHistory.length > 0) {
      e.preventDefault();
      const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
      if (newIndex !== historyIndex) {
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown' && historyIndex >= 0) {
      e.preventDefault();
      const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
      setHistoryIndex(newIndex);
      if (newIndex >= 0) {
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else {
        setInput('');
      }
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: AutoCompleteSuggestion) => {
    setInput(suggestion.text + ' ');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'system',
      content: '🧪 Testing Chat System Ready! Type /help for available commands.',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  // Get message icon
  const getMessageIcon = (type: ChatMessage['type']) => {
    switch (type) {
      case 'user':
        return <Terminal className="h-4 w-4 text-blue-500" />;
      case 'system':
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Command className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get message color
  const getMessageColor = (type: ChatMessage['type']) => {
    switch (type) {
      case 'user':
        return 'text-blue-600';
      case 'system':
        return 'text-gray-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5" />
          Testing Chat
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {commandHistory.length} commands
          </Badge>
          <Button variant="ghost" size="sm" onClick={clearChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getMessageIcon(message.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${getMessageColor(message.type)}`}>
                    {message.content}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  {message.result?.data && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(message.result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 relative">
          {/* Auto-complete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute bottom-full left-4 right-4 mb-2 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.text}
                  className={`p-2 cursor-pointer flex items-center justify-between ${
                    index === selectedSuggestion ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div>
                    <div className="font-mono text-sm">{suggestion.text}</div>
                    <div className="text-xs text-gray-500">{suggestion.description}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {suggestion.category}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Command Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command (e.g., /level 50, /help)..."
                className="font-mono"
                disabled={isExecuting}
              />
              {isExecuting && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            <Button type="submit" disabled={!input.trim() || isExecuting}>
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Commands */}
          <div className="mt-2 flex flex-wrap gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeCommand('/help')}
              className="text-xs"
            >
              /help
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeCommand('/level 10')}
              className="text-xs bg-blue-50 hover:bg-blue-100"
            >
              /level 10
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeCommand('/coins 1000')}
              className="text-xs bg-green-50 hover:bg-green-100"
            >
              /coins 1k
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeCommand('/reset-all')}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-700"
            >
              /reset-all
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeCommand('/system-health')}
              className="text-xs"
            >
              /health
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestingChat;
