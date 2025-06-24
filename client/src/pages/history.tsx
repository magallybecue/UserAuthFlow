import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, RefreshCw, Trash2, Search } from "lucide-react";
import { Link } from "wouter";
import type { Upload } from "@/lib/types";

export default function History() {
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

  const { data: uploads } = useQuery<Upload[]>({
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Concluído';
      case 'PROCESSING':
        return 'Processando';
      case 'FAILED':
        return 'Falhou';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
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
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateMatchRate = (upload: Upload) => {
    if (!upload.totalItems || upload.totalItems === 0) return 0;
    return Math.round((upload.processedItems || 0) / upload.totalItems * 100);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar currentPage="history" />
      
      <main className="flex-1 ml-64">
        <TopBar title="Histórico de Uploads" />
        
        <div className="p-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                    Histórico de Uploads
                  </CardTitle>
                  <p className="text-gray-600">
                    Gerencie seus uploads anteriores e baixe resultados
                  </p>
                </div>
                <div className="mt-4 lg:mt-0">
                  <div className="relative">
                    <Input 
                      placeholder="Buscar por nome do arquivo..." 
                      className="pl-10 w-80"
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {uploads && uploads.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Arquivo</TableHead>
                        <TableHead>Data Upload</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Itens</TableHead>
                        <TableHead>Progresso</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploads.map((upload) => (
                        <TableRow key={upload.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-400 mr-3" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {upload.originalName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(upload.fileSize)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm text-gray-900">
                                {formatDate(upload.createdAt)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTime(upload.createdAt)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(upload.status)}>
                              {getStatusText(upload.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-900">
                              {upload.totalItems || '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {upload.status === 'PROCESSING' ? (
                              <div className="text-sm">
                                <span className="text-yellow-600 font-medium">
                                  {upload.processedItems || 0}
                                </span>
                                <span className="text-gray-500">
                                  {upload.totalItems ? ` / ${upload.totalItems}` : ''}
                                </span>
                                <div className="text-xs text-gray-500">
                                  Em andamento...
                                </div>
                              </div>
                            ) : upload.status === 'COMPLETED' && upload.totalItems ? (
                              <div className="text-sm">
                                <span className="text-green-600 font-medium">
                                  {upload.processedItems || upload.totalItems}
                                </span>
                                <span className="text-gray-500">
                                  / {upload.totalItems}
                                </span>
                                <div className="text-xs text-gray-500">
                                  {calculateMatchRate(upload)}% processados
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {upload.status === 'COMPLETED' && (
                                <>
                                  <Link href={`/review/${upload.id}`}>
                                    <Button size="sm" variant="ghost" title="Ver detalhes">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button size="sm" variant="ghost" title="Baixar resultados">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              
                              {upload.status === 'PROCESSING' && (
                                <Link href={`/processing/${upload.id}`}>
                                  <Button size="sm" variant="ghost" title="Ver progresso">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </Link>
                              )}
                              
                              {upload.status === 'FAILED' && (
                                <Button size="sm" variant="ghost" title="Reprocessar">
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                              
                              <Button size="sm" variant="ghost" title="Excluir">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum upload encontrado
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Você ainda não fez nenhum upload de arquivos.
                  </p>
                  <Link href="/upload">
                    <Button>
                      Fazer Primeiro Upload
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
