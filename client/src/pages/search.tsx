import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Eye, Download } from "lucide-react";
import type { Material, Category, Subcategory } from "@/lib/types";

export default function Search() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [hasSearched, setHasSearched] = useState(false);

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

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    enabled: isAuthenticated,
  });

  const { data: subcategories } = useQuery<Subcategory[]>({
    queryKey: ["/api/subcategories", selectedCategory],
    enabled: isAuthenticated && !!selectedCategory,
  });

  const { data: searchResults, isLoading: searching } = useQuery<Material[]>({
    queryKey: ["/api/materials/search", { q: searchQuery, categoryId: selectedCategory }],
    enabled: isAuthenticated && hasSearched && searchQuery.length > 0,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar currentPage="search" />
      
      <main className="flex-1 ml-64">
        <TopBar title="Busca Manual CATMAT" />
        
        <div className="p-6 space-y-6">
          {/* Search Form */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Busca Manual CATMAT
                </h2>
                <p className="text-gray-600">
                  Pesquise materiais na base oficial do governo
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Material
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Digite a descrição do material..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-12"
                    />
                    <SearchIcon className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as categorias</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategoria
                    </label>
                    <Select 
                      value={selectedSubcategory} 
                      onValueChange={setSelectedSubcategory}
                      disabled={!selectedCategory || selectedCategory === 'all'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as subcategorias" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as subcategorias</SelectItem>
                        {subcategories?.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="inactive">Inativos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={handleSearch}
                    disabled={!searchQuery.trim() || searching}
                    size="lg"
                  >
                    <SearchIcon className="mr-2 h-4 w-4" />
                    {searching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {hasSearched && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium text-gray-900">
                    Resultados da Busca
                  </CardTitle>
                  <div className="text-sm text-gray-500">
                    {searchResults?.length || 0} materiais encontrados
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {searching ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Buscando materiais...</p>
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Código CATMAT</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Unidade</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((material) => (
                          <TableRow key={material.id}>
                            <TableCell>
                              <code className="text-sm font-mono">
                                {material.code}
                              </code>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <p className="text-sm text-gray-900 line-clamp-2">
                                {material.name}
                              </p>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-gray-600">
                                {material.unit || '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={material.active ? "default" : "secondary"}>
                                {material.active ? 'Ativo' : 'Inativo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : hasSearched && searchQuery ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Nenhum material encontrado para "{searchQuery}"
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
