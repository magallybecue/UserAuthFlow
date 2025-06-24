import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileDropZoneProps {
  onFileSelect?: (file: File) => void;
}

export default function FileDropZone({ onFileSelect }: FileDropZoneProps) {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV ou Excel (máx. 10MB)",
        variant: "destructive",
      });
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect?.(file);
      
      toast({
        title: "Arquivo selecionado",
        description: `${file.name} está pronto para processamento`,
      });
    }
  }, [onFileSelect, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-300 hover:border-primary-500'
        }`}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
          <Upload className="h-8 w-8 text-primary-700" />
        </div>
        
        <div>
          <p className="text-lg font-medium text-gray-900">
            {isDragActive ? 'Solte o arquivo aqui' : 'Arraste seus arquivos aqui'}
          </p>
          <p className="text-gray-600">
            ou <button type="button" className="text-primary-700 hover:text-primary-800 font-medium">
              clique para selecionar
            </button>
          </p>
        </div>
        
        <p className="text-sm text-gray-500">
          Suporta CSV, XLSX, XLS (máx. 10MB)
        </p>
      </div>

      {selectedFile && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center">
            <FileText className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-700">
              {selectedFile.name} selecionado
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
