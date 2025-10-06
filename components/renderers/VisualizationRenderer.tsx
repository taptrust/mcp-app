'use client';

import { VisualizationResource } from '@/types/app-resources';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, TrendingUp, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface VisualizationRendererProps {
  data: VisualizationResource;
}

export default function VisualizationRenderer({ data }: VisualizationRendererProps) {
  // Handle both new and old data structures
  const metadata = data.metadata || {};
  const style = data.style || data.styling || {};
  const colors = style.colors || {};
  const primaryColor = colors.primary || colors.timeline || '#1a3e72';
  const secondaryColor = colors.secondary || colors.background || '#8cb3d9';

  const safeMetadata = metadata as any;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}20` }}>
              <BarChart3 className="h-6 w-6" style={{ color: primaryColor }} />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900 dark:text-slate-100">
                {data?.metadata?.title || 'Untitled Visualization'}
              </CardTitle>
              {data?.metadata?.description && (
                <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                  {data.metadata.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
           {(data as any).type === 'timeline' || data.data?.type === 'timeline' || (data as any).view?.type === 'timeline' ? (
            // Timeline visualization
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <Calendar className="h-4 w-4" style={{ color: primaryColor }} />
                <span className="font-medium">Project Timeline</span>
              </div>
              
              <div className="space-y-4 pl-6 border-l-2" style={{ borderColor: primaryColor }}>
                {data.data?.items?.map((item: any, index: number) => {
                   const startDate = item.start ? new Date(item.start) : item.startDate ? new Date(item.startDate) : null;
                   const endDate = item.end ? new Date(item.end) : item.endDate ? new Date(item.endDate) : null;

                   // Get label field - use the mapping if it exists, otherwise try common field names
                   const labelField = data.data?.fields?.label || 'title';
                   const descriptionField = data.data?.fields?.description || 'description';
                   const label = item[labelField] || item.title || item.label || `Milestone ${index + 1}`;
                   const description = item[descriptionField] || item.description;

                  return (
                    <div key={item.id || index} className="relative pb-6">
                      <div className="absolute w-3 h-3 rounded-full -left-8" style={{ backgroundColor: primaryColor }} />
                      <div className="absolute w-0.5 h-full bg-slate-200 dark:bg-slate-700 -left-7 -top-1" />

                      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-semibold" style={{ color: colors.label || 'inherit' }}>
                          {label}
                        </h3>

                        {(startDate || endDate) && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {startDate && format(startDate, 'MMM d, yyyy')}
                              {endDate && ` - ${format(endDate, 'MMM d, yyyy')}`}
                            </span>
                          </div>
                        )}

                        {description && (
                          <p className="mt-2 text-sm" style={{ color: colors.description || 'inherit' }}>
                            {description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {data.data?.source && (
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-4">
                  Data source: {data.data.source}
                </div>
               )}
             </div>
           ) : data.components && data.components.length > 0 ? (
             // Components-based visualization
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {data.components.map((component, index) => (
                 <div key={index} className={`space-y-4 ${component.type === 'chart' ? 'lg:col-span-2' : ''}`}>
                   {component.type === 'metric' ? (
                     <Card className="shadow-sm h-full">
                       <CardContent className="p-6">
                         <div className="flex items-center justify-between">
                           <div>
                             <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{(component as any).title}</p>
                             <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                               {(component as any).format === 'currency' ? '$' : ''}{(component as any).value?.toLocaleString()}
                             </p>
                             {(component as any).change && (
                               <p className={`text-sm ${(component as any).change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                 {(component as any).change > 0 ? '+' : ''}{(component as any).change}%
                               </p>
                             )}
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                   ) : (component as any).subtype === 'line' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <TrendingUp className="h-4 w-4" style={{ color: primaryColor }} />
                          <span className="font-medium">
                            {(component as any).options?.title || 'Revenue Trends'}
                          </span>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 shadow-inner">
                          <div className="h-64 flex items-end justify-around gap-2">
                            {(() => {
                              const sourceData = (data as any).data?.[(component as any).data?.source];
                              if (!sourceData || !Array.isArray(sourceData)) {
                                return <div className="text-center text-slate-500">No data available</div>;
                              }

                              const xField = (component as any).data?.fields?.x || 'month';
                              const yField = (component as any).data?.fields?.y || 'revenue';
                              const maxValue = Math.max(...sourceData.map(item => item[yField] || 0));

                              return sourceData.map((item, i) => {
                                const value = item[yField] || 0;
                                const heightPx = maxValue > 0 ? Math.floor((value / maxValue) * 240) : 0;

                                return (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                    <div
                                      className="w-full rounded-t-lg transition-all duration-300 group-hover:scale-105 shadow-sm"
                                      style={{
                                        height: `${Math.max(heightPx, 12)}px`,
                                        background: `linear-gradient(to top, ${primaryColor}, ${primaryColor}dd)`
                                      }}
                                    />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                      {item[xField] || `Item ${i + 1}`}
                                    </span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>
                    ) : (component as any).subtype === 'bar' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                          <BarChart3 className="h-4 w-4" style={{ color: primaryColor }} />
                          <span className="font-medium">
                            {(component as any).options?.title || 'Bar Chart'}
                          </span>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 shadow-inner">
                          <div className="h-64 flex items-end justify-around gap-2">
                            {(() => {
                              const sourceData = (data as any).data?.[(component as any).data?.source];
                              if (!sourceData || !Array.isArray(sourceData)) {
                                return <div className="text-center text-slate-500">No data available</div>;
                              }

                              const xField = (component as any).data?.fields?.x || 'name';
                              const yField = (component as any).data?.fields?.y || 'revenue';
                              const maxValue = Math.max(...sourceData.map(item => item[yField] || 0));

                              return sourceData.map((item, i) => {
                                const value = item[yField] || 0;
                                const heightPx = maxValue > 0 ? Math.floor((value / maxValue) * 240) : 0;

                                return (
                                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                                    <div
                                      className="w-full rounded-t-lg transition-all duration-300 group-hover:scale-105 shadow-sm"
                                      style={{
                                        height: `${Math.max(heightPx, 12)}px`,
                                        background: `linear-gradient(to top, ${secondaryColor}, ${secondaryColor}dd)`
                                      }}
                                    />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                      {item[xField] || `Item ${i + 1}`}
                                    </span>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      </div>
                   ) : null}

                   {(component as any).data?.source && (
                     <div className="text-sm text-slate-500 dark:text-slate-400 mt-4">
                       <p>Data Source: {(component as any).data.source}</p>
                       {(component as any).data.fields && (
                         <p>Fields: {(component as any).data.fields.x} (X-axis), {(component as any).data.fields.y} (Y-axis)</p>
                       )}
                     </div>
                   )}
                 </div>
               ))}
             </div>
           ) : (
            // Fallback when no visualization data is available
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-8 shadow-inner">
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="p-4 rounded-full bg-slate-200 dark:bg-slate-600 inline-flex">
                      <BarChart3 className="h-12 w-12 text-slate-400 dark:text-slate-500" />
                    </div>
                    <div>
               <p className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                 {safeMetadata.title || 'Interactive Visualization'}
               </p>
               <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
                 {safeMetadata.description || 'No visualization data available. Please check your data source.'}
               </p>
                    </div>
                  </div>
                </div>
              </div>
              {(data as any).data && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span><strong>Data Source:</strong> {(data as any).data.source}</span>
                  </div>
                  {(data as any).data.fields && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mt-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span><strong>Fields:</strong> {(data as any).data.fields.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
