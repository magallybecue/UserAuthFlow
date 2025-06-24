import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import StatCard from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, CheckCircle, Clock, TrendingUp, FileText, Search, Eye } from "lucide-react";
import { Link } from "wouter";
import type { DashboardStats, Upload as UploadType } from "@/lib/types";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentUploads } = useQuery<UploadType[]>({
    queryKey: ["/api/uploads"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `Há ${diffDays - 1} dias`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar currentPage="dashboard" />
      
      <main className="flex-1 ml-64">
        <TopBar title="Dashboard" />
        
        <div className="p-6 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Uploads este mês"
              value={stats?.monthlyUploads || 0}
              icon={Upload}
              bgColor="bg-primary-100"
              iconColor="text-primary-700"
            />
            
            <StatCard
              title="Itens processados"
              value={stats?.processedItems || 0}
              icon={CheckCircle}
              bgColor="bg-secondary-100"
              iconColor="text-secondary-600"
            />
            
            <StatCard
              title="Aguardando revisão"
              value={stats?.pendingReview || 0}
              icon={Clock}
              bgColor="bg-yellow-100"
              iconColor="text-yellow-600"
            />
            
            <StatCard
              title="Taxa de match"
              value={`${stats?.matchRate || 0}%`}
              icon={TrendingUp}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Uploads */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">
                  Uploads Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUploads?.slice(0, 3).map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {upload.originalName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(upload.createdAt)} • {formatFileSize(upload.fileSize)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(upload.status)}>
                        {upload.status === 'COMPLETED' ? 'Concluído' :
                         upload.status === 'PROCESSING' ? 'Processando' :
                         upload.status === 'FAILED' ? 'Falhou' : upload.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {(!recentUploads || recentUploads.length === 0) && (
                    <div className="text-center py-4 text-gray-500">
                      Nenhum upload recente
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/upload">
                  <Button 
                    className="w-full justify-start bg-primary-50 hover:bg-primary-100 text-primary-700 border-0"
                    variant="outline"
                  >
                    <Upload className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">Novo Upload</p>
                      <p className="text-sm text-primary-600">
                        Carregar nova lista de materiais
                      </p>
                    </div>
                  </Button>
                </Link>

                <Link href="/search">
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Search className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">Busca Manual</p>
                      <p className="text-sm text-gray-600">
                        Pesquisar na base CATMAT
                      </p>
                    </div>
                  </Button>
                </Link>

                <Link href="/history">
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Eye className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <p className="font-medium">Ver Histórico</p>
                      <p className="text-sm text-gray-600">
                        Gerenciar uploads anteriores
                      </p>
                    </div>
                  </Button>
                </Link>

                {stats && stats.pendingReview > 0 && (
                  <Link href="/review">
                    <Button 
                      className="w-full justify-start bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                      variant="outline"
                    >
                      <CheckCircle className="mr-3 h-4 w-4" />
                      <div className="text-left">
                        <p className="font-medium">Continuar Revisão</p>
                        <p className="text-sm text-yellow-600">
                          {stats.pendingReview} itens aguardando validação
                        </p>
                      </div>
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Link href="/upload">
        <Button
          size="lg"
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-primary-700 hover:bg-primary-800 z-50"
        >
          <Upload className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
