import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Check, X, Search, Edit, Eye } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SearchModal from "@/components/search/search-modal";
import type { MatchedItem } from "@/lib/types";

interface ReviewTableProps {
  matches: MatchedItem[];
}

export default function ReviewTable({ matches }: ReviewTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MatchedItem | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ matchId, status, materialId }: {
      matchId: string;
      status: string;
      materialId?: string;
    }) => {
      return await apiRequest("PATCH", `/api/matches/${matchId}/status`, {
        status,
        materialId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({
        title: "Status atualizado",
        description: "O status do match foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status do match.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (matchId: string) => {
    updateStatusMutation.mutate({ matchId, status: 'APPROVED' });
  };

  const handleReject = (matchId: string) => {
    updateStatusMutation.mutate({ matchId, status: 'REJECTED' });
  };

  const handleSearchAlternative = (item: MatchedItem) => {
    setSelectedItem(item);
    setSearchModalOpen(true);
  };

  const handleSelectAlternative = (materialId: string) => {
    if (selectedItem) {
      updateStatusMutation.mutate({
        matchId: selectedItem.id,
        status: 'MANUAL',
        materialId,
      });
      setSearchModalOpen(false);
      setSelectedItem(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'NOT_FOUND':
        return <Badge className="bg-gray-100 text-gray-800">Não encontrado</Badge>;
      case 'MANUAL':
        return <Badge className="bg-blue-100 text-blue-800">Manual</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatScore = (score: number) => {
    return Math.round(score);
  };

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Nenhum item para revisão encontrado.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-medium text-gray-500 uppercase tracking-wider">
                    Descrição Original
                  </TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase tracking-wider">
                    Match CATMAT
                  </TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50">
                    <TableCell className="max-w-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {item.originalText}
                        </p>
                        {item.uploadItem?.quantity && (
                          <p className="text-xs text-gray-500 mt-1">
                            Qtd: {item.uploadItem.quantity} {item.uploadItem.unit || 'unidades'}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell className="max-w-md">
                      {item.matchedText ? (
                        <div>
                          <p className="text-sm text-gray-900 line-clamp-2">
                            {item.matchedText}
                          </p>
                          {item.material && (
                            <p className="text-xs text-gray-500 mt-1">
                              CATMAT: {item.material.code}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-gray-500">
                          <p className="text-sm">Nenhum match encontrado</p>
                          <p className="text-xs">Sugestão necessária</p>
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {item.confidenceScore > 0 ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-2 bg-gray-200 rounded-full">
                            <div 
                              className={`h-2 rounded-full ${getConfidenceColor(item.confidenceScore)}`}
                              style={{ width: `${Math.min(item.confidenceScore, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {formatScore(item.confidenceScore)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">--</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {getStatusBadge(item.status)}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex space-x-2">
                        {item.status === 'PENDING' && item.materialId && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(item.id)}
                              disabled={updateStatusMutation.isPending}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              title="Aprovar"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(item.id)}
                              disabled={updateStatusMutation.isPending}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              title="Rejeitar"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSearchAlternative(item)}
                          disabled={updateStatusMutation.isPending}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          title="Buscar alternativa"
                        >
                          <Search className="h-4 w-4" />
                        </Button>
                        
                        {item.material && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando <span className="font-medium">1</span> a{' '}
              <span className="font-medium">{Math.min(matches.length, 10)}</span> de{' '}
              <span className="font-medium">{matches.length}</span> resultados
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="ghost" disabled>
                Anterior
              </Button>
              <Button size="sm" variant="ghost" className="bg-primary-700 text-white">
                1
              </Button>
              <Button size="sm" variant="ghost" disabled={matches.length <= 10}>
                Próximo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => {
          setSearchModalOpen(false);
          setSelectedItem(null);
        }}
        originalText={selectedItem?.originalText || ""}
        onSelectMaterial={handleSelectAlternative}
      />
    </>
  );
}
