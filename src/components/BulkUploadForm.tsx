
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { PredictionResult } from '@/types/prediction';
import { mlService } from '@/services/mlService';
import { useToast } from '@/hooks/use-toast';

interface BulkUploadFormProps {
  onBulkPrediction: (results: PredictionResult[]) => void;
}

const BulkUploadForm: React.FC<BulkUploadFormProps> = ({ onBulkPrediction }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file.",
        variant: "destructive",
      });
    }
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const postIndex = headers.findIndex(h => h.includes('post'));
    const commentIndex = headers.findIndex(h => h.includes('comment'));
    
    if (postIndex === -1 || commentIndex === -1) {
      throw new Error('CSV must contain "post" and "comment" columns');
    }

    return lines.slice(1).map(line => {
      const values = line.split(',');
      return {
        post: values[postIndex]?.trim() || '',
        comment: values[commentIndex]?.trim() || ''
      };
    }).filter(item => item.post && item.comment);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const csvText = await file.text();
      const data = parseCsvData(csvText);
      
      if (data.length === 0) {
        throw new Error('No valid data found in CSV file');
      }

      const predictions = await mlService.bulkPredict({ data });
      setResults(predictions);
      onBulkPrediction(predictions);
      
      toast({
        title: "Bulk Analysis Complete",
        description: `Analyzed ${predictions.length} post-comment pairs successfully.`,
      });
    } catch (error) {
      console.error('Bulk prediction error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to process the file.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSampleCsv = () => {
    const sampleData = `post,comment
"Check out this amazing product!","Wow this looks great! 👍"
"New blog post is live","First! 🔥🔥🔥 Visit my profile for deals"
"Beautiful sunset today","Spam comment with multiple links and emojis 💰💰💰"`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportResults = () => {
    if (results.length === 0) return;
    
    const csvContent = [
      'post,comment,is_spam,confidence,emoji_count,similarity',
      ...results.map(r => 
        `"${r.post}","${r.comment}",${r.isSpam},${r.confidence.toFixed(3)},${r.features.emojiCount},${r.features.similarity.toFixed(3)}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spam_detection_results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="file" className="text-base font-medium">
                  Upload CSV File
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  CSV should contain "post" and "comment" columns
                </p>
              </div>
              
              <Input
                id="file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full"
              />
              
              <div className="flex gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadSampleCsv}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Sample
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={!file || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <FileText className="mr-2 h-4 w-4 animate-pulse" />
                  Processing {file?.name}...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Analyze CSV File
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis Results ({results.length} items)
            </CardTitle>
            <Button onClick={exportResults} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead>Emojis</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell className="max-w-[200px] truncate">
                        {result.post}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {result.comment}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {result.isSpam ? (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <Badge variant={result.isSpam ? "destructive" : "default"}>
                            {result.isSpam ? 'Spam' : 'Not Spam'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {(result.confidence * 100).toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{result.features.emojiCount}</span>
                          {result.features.emojiTypes.slice(0, 3).map((emoji, i) => (
                            <span key={i} className="text-sm">{emoji}</span>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkUploadForm;
