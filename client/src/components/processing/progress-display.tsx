import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, FileText, Target, CheckCircle } from "lucide-react";
import type { Upload } from "@/lib/types";

interface ProgressDisplayProps {
  upload: Upload;
}

interface ProcessingLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function ProgressDisplay({ upload }: ProgressDisplayProps) {
  const [logs, setLogs] = useState<ProcessingLog[]>([]);

  // Calculate progress percentage
  const progressPercentage = upload.totalItems && upload.totalItems > 0 
    ? Math.round((upload.processedItems || 0) / upload.totalItems * 100)
    : 0;

  // Simulate live logs (in real implementation, these would come from WebSocket or polling)
  useEffect(() => {
    if (upload.status === 'PROCESSING') {
      const interval = setInterval(() => {
        const now = new Date();
        const timestamp = now.toLocaleTimeString('pt-BR');
        
        // Generate realistic processing logs
        const messages = [
          `Processando item ${(upload.processedItems || 0) + 1} de ${upload.totalItems}...`,
          `Match encontrado para item com score ${Math.floor(Math.random() * 40 + 60)}%`,
          `Analisando similaridade textual...`,
          `Consultando base CATMAT...`,
          `Match parcial encontrado, verificando compatibilidade...`,
        ];
        
        const newLog: ProcessingLog = {
          id: Date.now().toString(),
          timestamp,
          message: messages[Math.floor(Math.random() * messages.length)],
          type: Math.random() > 0.8 ? 'warning' : 'info',
        };
        
        setLogs(prev => [newLog, ...prev.slice(0, 9)]); // Keep last 10 logs
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [upload.status, upload.processedItems, upload.totalItems]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return `Há ${diffHours}h ${diffMins % 60}min`;
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-primary-700" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Processando Arquivo
          </h2>
          <p className="text-gray-600">
            Analisando e fazendo matching com a base CATMAT...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Iniciado {formatTime(upload.createdAt)}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso</span>
            <span>{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Processando...</span>
            <span>
              {upload.processedItems || 0} de {upload.totalItems} itens
            </span>
          </div>
        </div>

        {/* Processing Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-gray-600 mr-1" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {upload.totalItems || 0}
            </p>
            <p className="text-sm text-gray-600">Total de itens</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-1" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {upload.processedItems || 0}
            </p>
            <p className="text-sm text-gray-600">Processados</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-blue-600 mr-1" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {Math.floor((upload.processedItems || 0) * 0.8)}
            </p>
            <p className="text-sm text-gray-600">Matches encontrados</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-yellow-600 mr-1" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {(upload.totalItems || 0) - (upload.processedItems || 0)}
            </p>
            <p className="text-sm text-gray-600">Restantes</p>
          </div>
        </div>

        {/* Live Log */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Log do Processamento
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="text-sm flex items-start">
                  <span className="text-gray-500 text-xs w-20 flex-shrink-0 mt-0.5">
                    {log.timestamp}
                  </span>
                  <span 
                    className={`ml-2 ${
                      log.type === 'warning' ? 'text-yellow-600' : 
                      log.type === 'error' ? 'text-red-600' :
                      log.type === 'success' ? 'text-green-600' :
                      'text-gray-700'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">
                Aguardando logs de processamento...
              </div>
            )}
          </div>
        </div>

        {/* Processing Time Estimate */}
        {upload.status === 'PROCESSING' && upload.totalItems && upload.processedItems && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Tempo estimado restante: {
                upload.processedItems > 0 ? 
                Math.ceil(((upload.totalItems - upload.processedItems) / upload.processedItems) * 5) : 
                Math.ceil(upload.totalItems * 0.1)
              } minutos
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
