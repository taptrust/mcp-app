'use client';

import { useState } from 'react';
import { SurveyResource } from '@/types/app-resources';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getThemeColors, hslToCSS, type ThemeName } from '@/lib/themes';

interface SurveyRendererProps {
  data: SurveyResource;
}

export default function SurveyRenderer({ data }: SurveyRendererProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentPageData = data.pages[currentPage];
  const progress = ((currentPage + 1) / data.pages.length) * 100;

  // Get theme colors
  const themeColors = getThemeColors((data.theme || 'ocean') as ThemeName);

  const handleNext = () => {
    if (currentPage < data.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6">
      {data.progressTracking && (
        <div className="mb-6">
          <div className="w-full rounded-full h-2" style={{ backgroundColor: hslToCSS(themeColors.muted) }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: hslToCSS(themeColors.primary)
              }}
            />
          </div>
          <p className="text-sm mt-2" style={{ color: hslToCSS(themeColors.mutedForeground) }}>
            Question {currentPage + 1} of {data.pages.length}
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          {currentPageData.title && <CardTitle>{currentPageData.title}</CardTitle>}
          {currentPageData.description && (
            <CardDescription>{currentPageData.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-base font-medium block mb-2">
              {currentPageData.question.prompt}
              {currentPageData.question.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {currentPageData.question.type === 'rating' && currentPageData.question.scale && (
              <div className="flex gap-2">
                {Array.from(
                  { length: currentPageData.question.scale.max - currentPageData.question.scale.min + 1 },
                  (_, i) => currentPageData.question.scale!.min + i
                ).map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAnswer(currentPageData.question.id, String(value))}
                    className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2"
                    style={{
                      backgroundColor: answers[currentPageData.question.id] === String(value)
                        ? hslToCSS(themeColors.primary)
                        : hslToCSS(themeColors.card),
                      color: answers[currentPageData.question.id] === String(value)
                        ? hslToCSS(themeColors.primaryForeground)
                        : hslToCSS(themeColors.cardForeground),
                      borderColor: answers[currentPageData.question.id] === String(value)
                        ? hslToCSS(themeColors.primary)
                        : hslToCSS(themeColors.border)
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}

            {currentPageData.question.type === 'text' && (
              <textarea
                value={answers[currentPageData.question.id] || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswer(currentPageData.question.id, e.target.value)}
                placeholder="Your answer..."
                className="w-full min-h-[120px] px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all resize-vertical"
                style={{
                  backgroundColor: '#fefefe', // Off-white background for better readability
                  color: '#1f2937', // Dark text color
                  borderColor: '#d1d5db',
                  borderWidth: '2px',
                  fontSize: '16px',
                  lineHeight: '1.5'
                }}
                onFocus={(e: React.FocusEvent<HTMLTextAreaElement>) => {
                  e.target.style.borderColor = hslToCSS(themeColors.primary);
                  e.target.style.boxShadow = `0 0 0 3px ${hslToCSS(themeColors.primary)}20`;
                }}
                onBlur={(e: React.FocusEvent<HTMLTextAreaElement>) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            )}

            {(currentPageData.question.type === 'choice' || currentPageData.question.type === 'multipleChoice') && currentPageData.question.options && (
              <div className="space-y-3">
                {currentPageData.question.options.map((option) => {
                  const isSelected = answers[currentPageData.question.id] === option;
                  
                  // Parse HSL values from theme colors
                  const parseHSL = (hsl: string) => {
                    const [h, s, l] = hsl.split(' ').map(Number);
                    return { h, s, l };
                  };
                  
                  const bgHsl = parseHSL(themeColors.background);
                  const primaryHsl = parseHSL(themeColors.primary);
                  const isDarkTheme = bgHsl.l < 50; // L is 0-100 in HSL
                  
                  // Adjust colors based on theme and selection state
                  const backgroundColor = isSelected 
                    ? isDarkTheme 
                      ? `hsl(${primaryHsl.h} ${primaryHsl.s}% ${Math.min(primaryHsl.l + 20, 100)}%)`
                      : `hsl(${primaryHsl.h}% ${Math.min(primaryHsl.s, 80)}% 95%)` // Lighter background for better contrast
                    : 'transparent';
                  
                  // Parse foreground HSL values
                  const foregroundHsl = parseHSL(themeColors.foreground);
                  
                  // Text colors with better contrast for selection state
                  const textColor = isSelected
                    ? isDarkTheme 
                      ? '#ffffff'  // White text on dark selected background
                      : `hsl(${primaryHsl.h} ${primaryHsl.s}% 20%)`  // Primary color text on light background
                    : isDarkTheme
                      ? `hsl(${foregroundHsl.h} ${foregroundHsl.s}% 90%)`  // Light text on dark background
                      : `hsl(${foregroundHsl.h} ${foregroundHsl.s}% 20%)`;  // Dark text on light background
                  
                  // Parse border HSL values
                  const borderHsl = themeColors.border ? parseHSL(themeColors.border) : { h: 0, s: 0, l: 0 };
                  
                  // More prominent border for selected items
                  const borderColor = isSelected
                    ? isDarkTheme
                      ? `hsl(${primaryHsl.h} ${primaryHsl.s}% ${Math.min(primaryHsl.l + 20, 100)}%)`
                      : `hsl(${primaryHsl.h} ${primaryHsl.s}% 60%)`  // More saturated border for light theme
                    : isDarkTheme
                      ? `hsl(${borderHsl.h} ${borderHsl.s}% ${Math.min(borderHsl.l + 10, 100)}%)`
                      : `hsl(${borderHsl.h} ${borderHsl.s}% ${borderHsl.l}%)`;
                  
                  const hoverBackground = isDarkTheme
                    ? `hsl(${primaryHsl.h} ${primaryHsl.s}% ${isSelected ? 30 : 15}%)`
                    : `hsl(${primaryHsl.h} ${primaryHsl.s}% ${isSelected ? 60 : 95}%)`;
                  
                  return (
                    <button
                      key={option}
                      className={`w-full text-left py-3 px-5 rounded-lg font-medium transition-all duration-200 border-2 hover:shadow-sm ${
                        isSelected ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        '--tw-ring-color': isSelected 
                          ? `hsl(${primaryHsl.h}, ${primaryHsl.s}%, ${isDarkTheme ? '60%' : '50%'})` 
                          : 'transparent',
                        '--tw-ring-offset-width': '2px',
                        '--tw-ring-offset-color': isDarkTheme ? `hsl(0, 0%, 10%)` : `hsl(0, 0%, 100%)`,
                        backgroundColor,
                        color: textColor,
                        borderColor,
                        '--hover-bg': hoverBackground,
                      } as React.CSSProperties}
                      onMouseOver={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = hoverBackground;
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              variant="outline"
            >
              Previous
            </Button>
            {currentPage < data.pages.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={() => alert('Survey submitted!')}>
                Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
