import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import FileDropZone from "@/components/upload/file-drop-zone";
import FilePreview from "@/components/upload/file-preview";
import { Card, CardContent } from "@/components/ui/card";

export default function Upload() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Não autorizado",
        description: "Você foi desconectado. Fazendo login novamente...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar currentPage="upload" />
      
      <main className="flex-1 ml-64">
        <TopBar title="Novo Upload" />
        
        <div className="p-6">
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Novo Upload
                </h2>
                <p className="text-gray-600">
                  Faça upload de sua lista de materiais em formato CSV ou Excel
                </p>
              </div>

              {!selectedFile ? (
                <FileDropZone onFileSelect={handleFileSelect} />
              ) : (
                <FilePreview file={selectedFile} onRemove={handleFileRemove} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
