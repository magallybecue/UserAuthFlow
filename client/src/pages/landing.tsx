import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Upload, Search, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-700 rounded-xl flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              CATMAT Matcher
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sistema completo para padronização de materiais usando a base oficial CATMAT do governo brasileiro.
              Faça upload, processe automaticamente e exporte resultados padronizados.
            </p>
            <Button 
              size="lg" 
              className="bg-primary-700 hover:bg-primary-800"
              onClick={() => window.location.href = '/api/login'}
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-gray-600">
            Padronize suas listas de materiais em poucos passos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Upload className="h-6 w-6 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                1. Faça Upload
              </h3>
              <p className="text-gray-600">
                Envie sua lista de materiais em formato CSV ou Excel.
                Nosso sistema suporta diversos formatos de arquivo.
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                2. Processamento Automático
              </h3>
              <p className="text-gray-600">
                Nossa IA encontra correspondências automáticas na base CATMAT
                oficial, com scores de confiança para cada match.
              </p>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-primary-700" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                3. Revisão e Exportação
              </h3>
              <p className="text-gray-600">
                Revise os matches encontrados, faça ajustes manuais se necessário
                e exporte sua lista padronizada.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Benefícios
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Por que usar o CATMAT Matcher?
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Conformidade garantida:</strong> Use a base oficial CATMAT do governo brasileiro
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Economia de tempo:</strong> Processe centenas de itens automaticamente
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Precisão alta:</strong> Sistema inteligente com scores de confiança
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-secondary-500 mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>Controle total:</strong> Revisão manual para garantir qualidade
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-700 mb-2">87%</div>
                <div className="text-sm text-gray-600">Taxa média de matches automáticos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-700 mb-2">10x</div>
                <div className="text-sm text-gray-600">Mais rápido que processo manual</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-700 mb-2">100%</div>
                <div className="text-sm text-gray-600">Conformidade com CATMAT</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-700 mb-2">24/7</div>
                <div className="text-sm text-gray-600">Disponibilidade do sistema</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Faça login e comece a padronizar suas listas de materiais agora mesmo.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => window.location.href = '/api/login'}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
