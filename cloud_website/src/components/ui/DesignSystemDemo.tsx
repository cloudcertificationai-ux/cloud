'use client';

import React from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  Badge, 
  Input, 
  Typography, 
  Avatar,
  Spinner 
} from './index';

/**
 * Design System Demo Component
 * Showcases the Simplilearn-inspired design system components
 */
const DesignSystemDemo: React.FC = () => {
  const [inputValue, setInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleButtonClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-neutral-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Typography variant="h1" color="navy" className="mb-2">
          Simplilearn Design System
        </Typography>
        <Typography variant="body1" color="neutral" className="mb-8">
          Professional, enterprise-grade UI components for the anywheredoor platform
        </Typography>

        {/* Buttons Section */}
        <Card className="mb-8">
          <CardHeader title="Buttons" subtitle="Various button styles and states" />
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" color="primary">Primary</Button>
                <Button variant="primary" color="navy">Navy</Button>
                <Button variant="primary" color="accent">Accent</Button>
                <Button variant="secondary" color="primary">Secondary</Button>
                <Button variant="outline" color="primary">Outline</Button>
                <Button variant="ghost" color="primary">Ghost</Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button loading={loading} onClick={handleButtonClick}>
                  {loading ? 'Loading...' : 'Click me'}
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography Section */}
        <Card className="mb-8">
          <CardHeader title="Typography" subtitle="Text styles and hierarchy" />
          <CardContent>
            <div className="space-y-4">
              <Typography variant="h1">Heading 1</Typography>
              <Typography variant="h2">Heading 2</Typography>
              <Typography variant="h3">Heading 3</Typography>
              <Typography variant="h4">Heading 4</Typography>
              <Typography variant="body1">
                Body text with normal weight and comfortable line height for reading.
              </Typography>
              <Typography variant="body2" color="neutral">
                Smaller body text often used for secondary information.
              </Typography>
              <Typography variant="caption" color="neutral">
                Caption text for image descriptions or fine print.
              </Typography>
              <Typography variant="overline" color="primary">
                Overline text for labels
              </Typography>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card className="mb-8">
          <CardHeader title="Badges" subtitle="Status indicators and labels" />
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge color="primary">Primary</Badge>
                <Badge color="accent">Success</Badge>
                <Badge color="warning">Warning</Badge>
                <Badge color="error">Error</Badge>
                <Badge color="neutral">Neutral</Badge>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" color="primary">Outline</Badge>
                <Badge variant="filled" color="accent">Filled</Badge>
                <Badge rounded color="primary">Rounded</Badge>
                <Badge removable color="warning" onRemove={() => console.log('Removed')}>
                  Removable
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card className="mb-8">
          <CardHeader title="Inputs" subtitle="Form controls and text inputs" />
          <CardContent>
            <div className="space-y-4 max-w-md">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="We'll never share your email"
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="Enter password"
                required
              />
              
              <Input
                label="Search"
                type="search"
                placeholder="Search courses..."
                leftIcon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
              
              <Input
                label="Error State"
                placeholder="This field has an error"
                error
                helperText="This field is required"
              />
            </div>
          </CardContent>
        </Card>

        {/* Avatars and Loading Section */}
        <Card className="mb-8">
          <CardHeader title="Avatars & Loading" subtitle="User avatars and loading states" />
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar size="sm" fallback="JS" />
                <Avatar size="md" fallback="AB" />
                <Avatar size="lg" fallback="CD" border />
                <Avatar size="xl" fallback="EF" />
              </div>
              
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" color="accent" />
                <Spinner size="lg" color="warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="elevated" hover>
            <CardHeader 
              title="Course Card Example" 
              subtitle="Interactive card with hover effects"
              action={<Badge color="accent">New</Badge>}
            />
            <CardContent>
              <Typography variant="body2" className="mb-4">
                This is an example of how cards can be used to display course information
                with proper spacing and typography.
              </Typography>
              <div className="flex items-center gap-2 mb-4">
                <Avatar size="sm" fallback="JD" />
                <div>
                  <Typography variant="body2" weight="medium">John Doe</Typography>
                  <Typography variant="caption" color="neutral">Instructor</Typography>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="outlined" clickable onClick={() => alert('Card clicked!')}>
            <CardHeader title="Clickable Card" subtitle="Click anywhere on this card" />
            <CardContent>
              <Typography variant="body2">
                Cards can be made clickable for navigation or actions. This card will
                show an alert when clicked.
              </Typography>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DesignSystemDemo;