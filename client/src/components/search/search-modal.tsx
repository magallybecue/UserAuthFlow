import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import type { Material } from "@/lib/types";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onSelectMaterial: (materialId: string) => void;
}

export default function SearchModal({ 
  isOpen, 
  onClose, 
  originalText, 
  onSelectMaterial 
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const { data: searchResults, isLoading } = useQuery<Material[]>({
    queryKey: ["/api/materials/search", { q: searchQuery }],
    enabled: isOpen && searchQuery.length > 2,
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setSelectedMaterial(null);
  };

  const handleSelectMaterial = (material: Material) => {
    setSelectedMaterial(material);
  };

  const handleConfirmSelection = () => {
    if (selectedMaterial) {
      onSelectMaterial(selectedMaterial.id);
    }
  };

  const calculateMatchScore = (material: Material, query: string) => {
    // Simple similarity calculation based on common words
    const materialWords = material.name.toLowerCase().split(' ');
    const queryWords = query.toLowerCase().split(' ');
    const commonWords = materialWords.filter(word => 
      queryWords.some(qWord => word.includes(qWord) || qWord.includes(word))
    );
    return Math.min(Math.round((commonWords.length / Math.max(materialWords.length, queryWords.length)) * 100), 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-medium text-gray-900">
              Buscar Material Alternativo
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Original Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material original:
            </label>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {originalText}
            </div>
          </div>
          
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por:
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Digite termos de busca..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          {/* Search Results */}
          <div className="flex-1 overflow-hidden">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-60 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">
                    Buscando materiais...
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  searchResults.map((material) => {
                    const matchScore = calculateMatchScore(material, originalText);
                    const isSelected = selectedMaterial?.id === material.id;
                    
                    return (
                      <div
                        key={material.id}
                        className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors
                          ${isSelected ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50'}
                        `}
                        onClick={() => handleSelectMaterial(material)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                              {material.name}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className="text-xs text-gray-500">
                                CATMAT: {material.code}
                              </p>
                              {material.unit && (
                                <p className="text-xs text-gray-500">
                                  • {material.unit}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <Badge 
                              variant="secondary"
                              className={`
                                ${matchScore >= 70 ? 'bg-green-100 text-green-800' :
                                  matchScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'}
                              `}
                            >
                              {matchScore}%
                            </Badge>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="mt-2 text-xs text-primary-700 font-medium">
                            ✓ Selecionado
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : searchQuery.length > 2 ? (
                  <div className="p-4 text-center text-gray-500">
                    Nenhum material encontrado para "{searchQuery}"
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    Digite pelo menos 3 caracteres para buscar
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmSelection}
            disabled={!selectedMaterial}
            className="bg-primary-700 hover:bg-primary-800"
          >
            Confirmar Seleção
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
