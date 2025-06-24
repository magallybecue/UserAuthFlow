import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import ReviewTable from "@/components/review/review-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, CheckCircle, Search } from "lucide-react";
import type { Upload, MatchedItem } from "@/lib/types";

export default function Review() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const params = useParams();
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

  const { data: upload } = useQuery<Upload>({
    queryKey: ["/api/uploads", uploadId],
    enabled: isAuthenticated && !!uploadId,
  });

  const { data: matches } = useQuery<MatchedItem[]>({
    queryKey: ["/api/uploads", uploadId, "matches"],
    enabled: isAuthenticated && !!uploadId,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (!upload) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <Sidebar currentPage="" />
        <main className="flex-1 ml-64">
          <TopBar title="Revisão" />
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

  // Calculate stats
  const stats = matches ? {
    approved: matches.filter(m => m.status === 'APPROVED').length,
    pending: matches.filter(m => m.status === 'PENDING').length,
    rejected: matches.filter(m => m.status === 'REJECTED').length,
    notFound: matches.filter(m => m.status === 'NOT_FOUND').length,
  } : { approved: 0, pending: 0, rejected: 0, notFound: 0 };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar currentPage="review" />
      
      <main className="flex-1 ml-64">
        <TopBar title="Revisão de Matches" />
        
        <div className="p-6 space-y-6">
          {/* Review Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Revisão de Matches
                  </h2>
                  <p className="text-gray-600 mb-4 lg:mb-0">
                    Arquivo: {upload.originalName}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                  <Button>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Aprovar Todos
                  </Button>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  <p className="text-sm text-green-700">Aprovados</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  <p className="text-sm text-yellow-700">Pendentes</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  <p className="text-sm text-red-700">Rejeitados</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">{stats.notFound}</p>
                  <p className="text-sm text-gray-700">Não encontrados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters and Search */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Input 
                    placeholder="Buscar por descrição..." 
                    className="w-full"
                  />
                </div>
                <div className="flex gap-3">
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="approved">Aprovados</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="rejected">Rejeitados</SelectItem>
                      <SelectItem value="not_found">Não encontrados</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Todos os scores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os scores</SelectItem>
                      <SelectItem value="high">Alto (&gt;80%)</SelectItem>
                      <SelectItem value="medium">Médio (50-80%)</SelectItem>
                      <SelectItem value="low">Baixo (&lt;50%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Review Table */}
          <ReviewTable matches={matches || []} />
        </div>
      </main>
    </div>
  );
}
