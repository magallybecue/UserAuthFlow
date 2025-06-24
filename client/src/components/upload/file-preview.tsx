import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface FilePreviewProps {
  file?: File;
  onRemove?: () => void;
}

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [descriptionColumn, setDescriptionColumn] = useState("");
  const [quantityColumn, setQuantityColumn] = useState("");
  const queryClient = useQueryClient();

  // Mock columns for demo - in real implementation, parse file headers
  const availableColumns = [
    "A - Descrição do Material",
    "B - Nome do Item", 
    "C - Produto",
    "D - Quantidade",
    "E - Qtd",
    "F - Volume",
  ];

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await apiRequest("POST", "/api/uploads", formData);
    },
    onSuccess: async (response) => {
      const upload = await response.json();
      
      // Start processing
      await processMutation.mutateAsync({
        uploadId: upload.id,
        descriptionColumn,
        quantityColumn,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const processMutation = useMutation({
    mutationFn: async ({ uploadId, descriptionColumn, quantityColumn }: {
      uploadId: string;
      descriptionColumn: string;
      quantityColumn?: string;
    }) => {
      return await apiRequest("POST", `/api/uploads/${uploadId}/process`, {
        descriptionColumn,
        quantityColumn,
      });
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploads"] });
      toast({
        title: "Processamento iniciado",
        description: "Seu arquivo está sendo processado. Você será redirecionado para acompanhar o progresso.",
      });
      setLocation(`/processing/${variables.uploadId}`);
    },
    onError: (error) => {
      toast({
        title: "Erro no processamento",
        description: "Falha ao processar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleStartProcessing = async () => {
    if (!file || !descriptionColumn) {
      toast({
        title: "Configuração incompleta",
        description: "Por favor, selecione a coluna de descrição.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    uploadMutation.mutate(formData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!file) return null;

  return (
    <div className="mt-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Arquivo Selecionado
            </h3>
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-green-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} • Formato detectado: {file.type}
              </p>
            </div>
          </div>

          {/* Column Mapping */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Mapeamento de Colunas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coluna de Descrição *
                </label>
                <Select value={descriptionColumn} onValueChange={setDescriptionColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma coluna..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.slice(0, 3).map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Coluna de Quantidade (Opcional)
                </label>
                <Select value={quantityColumn} onValueChange={setQuantityColumn}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma coluna..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {availableColumns.slice(3).map((column) => (
                      <SelectItem key={column} value={column}>
                        {column}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onRemove}>
              Cancelar
            </Button>
            <Button 
              onClick={handleStartProcessing}
              disabled={!descriptionColumn || uploadMutation.isPending || processMutation.isPending}
            >
              {uploadMutation.isPending || processMutation.isPending ? 
                'Iniciando...' : 'Iniciar Processamento'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
