import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import ProgressDisplay from "@/components/processing/progress-display";
import { Card, CardContent } from "@/components/ui/card";
import type { Upload } from "@/lib/types";

export default function Processing() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const [, setLocation] = useLocation();
  const uploadId = params.id;

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

  const { data: upload, isLoading: uploadLoading } = useQuery<Upload>({
    queryKey: ["/api/uploads", uploadId],
    enabled: isAuthenticated && !!uploadId,
    refetchInterval: (data) => {
      // Stop polling if upload is completed or failed
      return data?.status === 'PROCESSING' ? 2000 : false;
    },
  });

  // Redirect to review when processing is complete
  useEffect(() => {
    if (upload?.status === 'COMPLETED') {
      toast({
        title: "Processamento concluído!",
        description: `${upload.processedItems} itens foram processados com sucesso.`,
      });
      setLocation(`/review/${uploadId}`);
    } else if (upload?.status === 'FAILED') {
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro durante o processamento do arquivo.",
        variant: "destructive",
      });
      setLocation('/history');
    }
  }, [upload?.status, uploadId, setLocation, toast, upload?.processedItems]);

  if (isLoading || !isAuthenticated || uploadLoading) {
    return null;
  }

  if (!upload) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar currentPage="" />
        <main className="flex-1 ml-64">
          <TopBar title="Processamento" />
          <div className="p-6">
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Upload não encontrado.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar currentPage="" />
      
      <main className="flex-1 ml-64">
        <TopBar title="Processando Arquivo" />
        
        <div className="p-6">
          <ProgressDisplay upload={upload} />
        </div>
      </main>
    </div>
  );
}
