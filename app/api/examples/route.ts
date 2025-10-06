import { NextResponse } from 'next/server';

// Hardcoded list of example files since we know exactly what we created
const EXAMPLE_FILES = [
  {
    id: 'customer-satisfaction-survey',
    filename: 'customer-satisfaction-survey.json',
    name: 'Customer Satisfaction Survey',
    category: 'survey'
  },
  {
    id: 'employee-onboarding-survey',
    filename: 'employee-onboarding-survey.json',
    name: 'Employee Onboarding Survey',
    category: 'survey'
  },
  {
    id: 'event-registration-survey',
    filename: 'event-registration-survey.json',
    name: 'Event Registration Survey',
    category: 'survey'
  },
  {
    id: 'sales-dashboard',
    filename: 'sales-dashboard.json',
    name: 'Sales Performance Dashboard',
    category: 'visualization'
  },
  {
    id: 'website-analytics',
    filename: 'website-analytics.json',
    name: 'Website Analytics Overview',
    category: 'visualization'
  },
  {
    id: 'project-timeline',
    filename: 'project-timeline.json',
    name: 'Project Timeline & Milestones',
    category: 'visualization'
  },
  {
    id: 'smart-fitness-watch',
    filename: 'smart-fitness-watch.json',
    name: 'Smart Fitness Watch Pro',
    category: 'product'
  },
  {
    id: 'customer-insights-dashboard',
    filename: 'customer-insights-dashboard.json',
    name: 'Customer Insights Dashboard',
    category: 'multi'
  }
];

export async function GET() {
  try {
    return NextResponse.json(EXAMPLE_FILES);
  } catch (error) {
    console.error('Error fetching examples:', error);
    return NextResponse.json(
      { error: 'Failed to fetch examples' },
      { status: 500 }
    );
  }
}
