"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle } from "lucide-react";

// Tipos
type Status = "Pago" | "Em aberto" | "Atrasado" | "Recebido" | "Pendente";

interface ContaPagar {
  id: string;
  dataVencimento: string;
  fornecedor: string;
  categoria: string;
  descricao: string;
  valor: number;
  status: Status;
  formaPagamento: string;
}

interface ContaReceber {
  id: string;
  dataRecebimento: string;
  cliente: string;
  descricao: string;
  valor: number;
  status: Status;
  formaRecebimento: string;
}

export default function PlanilhaFinanceira() {
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [saldoInicial, setSaldoInicial] = useState<number>(0);
  const [mesAno, setMesAno] = useState<string>("");

  // Inicializar mês e ano atual
  useEffect(() => {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const ano = hoje.getFullYear();
    setMesAno(`${ano}-${mes}`);
  }, []);

  // Função para calcular status automaticamente
  const calcularStatus = (data: string, statusManual?: string): Status => {
    if (statusManual === "Pago" || statusManual === "Recebido") {
      return statusManual;
    }
    const hoje = new Date();
    const dataVenc = new Date(data);
    if (dataVenc < hoje) {
      return "Atrasado";
    }
    return statusManual === "Recebido" ? "Recebido" : statusManual === "Pago" ? "Pago" : "Em aberto";
  };

  // Adicionar conta a pagar
  const adicionarContaPagar = () => {
    const novaConta: ContaPagar = {
      id: Date.now().toString(),
      dataVencimento: "",
      fornecedor: "",
      categoria: "Outros",
      descricao: "",
      valor: 0,
      status: "Em aberto",
      formaPagamento: "",
    };
    setContasPagar([...contasPagar, novaConta]);
  };

  // Adicionar conta a receber
  const adicionarContaReceber = () => {
    const novaConta: ContaReceber = {
      id: Date.now().toString(),
      dataRecebimento: "",
      cliente: "",
      descricao: "",
      valor: 0,
      status: "Pendente",
      formaRecebimento: "",
    };
    setContasReceber([...contasReceber, novaConta]);
  };

  // Atualizar conta a pagar
  const atualizarContaPagar = (id: string, campo: keyof ContaPagar, valor: any) => {
    setContasPagar(
      contasPagar.map((conta) => {
        if (conta.id === id) {
          const contaAtualizada = { ...conta, [campo]: valor };
          if (campo === "dataVencimento" || campo === "status") {
            contaAtualizada.status = calcularStatus(
              contaAtualizada.dataVencimento,
              campo === "status" ? valor : conta.status
            );
          }
          return contaAtualizada;
        }
        return conta;
      })
    );
  };

  // Atualizar conta a receber
  const atualizarContaReceber = (id: string, campo: keyof ContaReceber, valor: any) => {
    setContasReceber(
      contasReceber.map((conta) => {
        if (conta.id === id) {
          const contaAtualizada = { ...conta, [campo]: valor };
          if (campo === "dataRecebimento" || campo === "status") {
            contaAtualizada.status = calcularStatus(
              contaAtualizada.dataRecebimento,
              campo === "status" ? valor : conta.status
            ) as "Recebido" | "Pendente" | "Atrasado";
          }
          return contaAtualizada;
        }
        return conta;
      })
    );
  };

  // Remover conta
  const removerContaPagar = (id: string) => {
    setContasPagar(contasPagar.filter((c) => c.id !== id));
  };

  const removerContaReceber = (id: string) => {
    setContasReceber(contasReceber.filter((c) => c.id !== id));
  };

  // Cálculos - Contas a Pagar
  const totalPagar = contasPagar.reduce((acc, c) => acc + c.valor, 0);
  const totalPago = contasPagar.filter((c) => c.status === "Pago").reduce((acc, c) => acc + c.valor, 0);
  const totalEmAberto = contasPagar.filter((c) => c.status !== "Pago").reduce((acc, c) => acc + c.valor, 0);

  // Cálculos - Contas a Receber
  const totalReceber = contasReceber.reduce((acc, c) => acc + c.valor, 0);
  const totalRecebido = contasReceber.filter((c) => c.status === "Recebido").reduce((acc, c) => acc + c.valor, 0);
  const totalPendente = contasReceber.filter((c) => c.status !== "Recebido").reduce((acc, c) => acc + c.valor, 0);

  // Cálculos - Fluxo de Caixa
  const entradas = totalRecebido;
  const saidas = totalPago;
  const saldoFinal = saldoInicial + entradas - saidas;
  const resultadoMes = entradas - saidas;

  // Função para cor do status
  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Pago":
      case "Recebido":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Em aberto":
      case "Pendente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "Atrasado":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Controle Financeiro Empresarial</h1>
              <p className="text-blue-100 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Período: {mesAno ? new Date(mesAno + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "Selecione o mês"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="month"
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                className="bg-white/90 backdrop-blur-sm border-2 border-white/40 text-slate-800 placeholder:text-slate-500 w-48 h-11 rounded-xl shadow-lg hover:bg-white transition-all duration-300 focus:ring-4 focus:ring-white/30 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl shadow-lg">
            <TabsTrigger value="resumo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
              Resumo Gerencial
            </TabsTrigger>
            <TabsTrigger value="pagar" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-rose-600 data-[state=active]:text-white">
              Contas a Pagar
            </TabsTrigger>
            <TabsTrigger value="receber" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white">
              Contas a Receber
            </TabsTrigger>
            <TabsTrigger value="fluxo" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-violet-600 data-[state=active]:text-white">
              Fluxo de Caixa
            </TabsTrigger>
          </TabsList>

          {/* RESUMO GERENCIAL */}
          <TabsContent value="resumo" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Faturamento do Mês
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {totalRecebido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                  <p className="text-xs text-green-100 mt-1">Total recebido</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Total de Despesas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                  <p className="text-xs text-red-100 mt-1">Total pago</p>
                </CardContent>
              </Card>

              <Card className={`bg-gradient-to-br ${resultadoMes >= 0 ? "from-blue-500 to-indigo-600" : "from-orange-500 to-red-600"} text-white border-0 shadow-xl`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    {resultadoMes >= 0 ? "Lucro" : "Prejuízo"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {resultadoMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                  <p className="text-xs opacity-90 mt-1">Resultado do mês</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Saldo Disponível
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {saldoFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </div>
                  <p className="text-xs text-purple-100 mt-1">Saldo final</p>
                </CardContent>
              </Card>
            </div>

            {/* Indicadores Financeiros */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Indicadores Financeiros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Contas a Receber Pendentes</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Contas a Pagar em Aberto</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {totalEmAberto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Margem de Lucro</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {totalRecebido > 0 ? ((resultadoMes / totalRecebido) * 100).toFixed(1) : "0.0"}%
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 dark:text-amber-100">Atenção</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Você tem {contasPagar.filter((c) => c.status === "Atrasado").length} contas atrasadas a pagar e{" "}
                        {contasReceber.filter((c) => c.status === "Atrasado").length} contas atrasadas a receber.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTAS A PAGAR */}
          <TabsContent value="pagar" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Contas a Pagar</CardTitle>
                <Button onClick={adicionarContaPagar} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conta
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-semibold">Vencimento</th>
                        <th className="text-left p-3 text-sm font-semibold">Fornecedor</th>
                        <th className="text-left p-3 text-sm font-semibold">Categoria</th>
                        <th className="text-left p-3 text-sm font-semibold">Descrição</th>
                        <th className="text-left p-3 text-sm font-semibold">Valor</th>
                        <th className="text-left p-3 text-sm font-semibold">Status</th>
                        <th className="text-left p-3 text-sm font-semibold">Pagamento</th>
                        <th className="text-left p-3 text-sm font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contasPagar.map((conta) => (
                        <tr key={conta.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <Input
                              type="date"
                              value={conta.dataVencimento}
                              onChange={(e) => atualizarContaPagar(conta.id, "dataVencimento", e.target.value)}
                              className="w-44 h-10 rounded-lg border-2 focus:ring-2 transition-all duration-200"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={conta.fornecedor}
                              onChange={(e) => atualizarContaPagar(conta.id, "fornecedor", e.target.value)}
                              placeholder="Nome do fornecedor"
                              className="h-10 rounded-lg border-2 focus:ring-2 transition-all duration-200"
                            />
                          </td>
                          <td className="p-3">
                            <Select value={conta.categoria} onValueChange={(v) => atualizarContaPagar(conta.id, "categoria", v)}>
                              <SelectTrigger className="w-40 h-10 rounded-lg border-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Aluguel">Aluguel</SelectItem>
                                <SelectItem value="Fornecedores">Fornecedores</SelectItem>
                                <SelectItem value="Impostos">Impostos</SelectItem>
                                <SelectItem value="Funcionários">Funcionários</SelectItem>
                                <SelectItem value="Energia">Energia</SelectItem>
                                <SelectItem value="Água">Água</SelectItem>
                                <SelectItem value="Internet">Internet</SelectItem>
                                <SelectItem value="Outros">Outros</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Input
                              value={conta.descricao}
                              onChange={(e) => atualizarContaPagar(conta.id, "descricao", e.target.value)}
                              placeholder="Descrição"
                              className="h-10 rounded-lg border-2 focus:ring-2 transition-all duration-200"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={conta.valor || ""}
                              onChange={(e) => atualizarContaPagar(conta.id, "valor", parseFloat(e.target.value) || 0)}
                              placeholder="0,00"
                              className="w-32 h-10 rounded-lg border-2 focus:ring-2 transition-all duration-200 font-semibold"
                            />
                          </td>
                          <td className="p-3">
                            <Select value={conta.status} onValueChange={(v) => atualizarContaPagar(conta.id, "status", v)}>
                              <SelectTrigger className={`w-32 h-10 rounded-lg border-2 font-medium ${getStatusColor(conta.status)}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pago">Pago</SelectItem>
                                <SelectItem value="Em aberto">Em aberto</SelectItem>
                                <SelectItem value="Atrasado">Atrasado</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Input
                              value={conta.formaPagamento}
                              onChange={(e) => atualizarContaPagar(conta.id, "formaPagamento", e.target.value)}
                              placeholder="PIX, Boleto..."
                              className="w-32 h-10 rounded-lg border-2 focus:ring-2 transition-all duration-200"
                            />
                          </td>
                          <td className="p-3">
                            <Button variant="destructive" size="sm" onClick={() => removerContaPagar(conta.id)} className="rounded-lg">
                              Excluir
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totalizadores */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total a Pagar</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {totalPagar.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Pago</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {totalPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total em Aberto</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {totalEmAberto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CONTAS A RECEBER */}
          <TabsContent value="receber" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Contas a Receber</CardTitle>
                <Button onClick={adicionarContaReceber} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conta
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 text-sm font-semibold">Recebimento</th>
                        <th className="text-left p-3 text-sm font-semibold">Cliente</th>
                        <th className="text-left p-3 text-sm font-semibold">Descrição</th>
                        <th className="text-left p-3 text-sm font-semibold">Valor</th>
                        <th className="text-left p-3 text-sm font-semibold">Status</th>
                        <th className="text-left p-3 text-sm font-semibold">Recebimento</th>
                        <th className="text-left p-3 text-sm font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contasReceber.map((conta) => (
                        <tr key={conta.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <Input
                              type="date"
                              value={conta.dataRecebimento}
                              onChange={(e) => atualizarContaReceber(conta.id, "dataRecebimento", e.target.value)}
                              className="w-44 h-10 rounded-lg border-2 focus:ring-2 transition-all duration-200"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={conta.cliente}
                              onChange={(e) => atualizarContaReceber(conta.id, "cliente", e.target.value)}
                              placeholder="Nome do cliente"
                              className="h-10 rounded-lg border-2 focus:ring-2 transition-all duration-200"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              value={conta.descricao}
                              onChange={(e) => atualizarContaReceber(conta.id, "descricao", e.target.value)}
                              placeholder="Descrição"
                              className="h-10 rounded-lg border-2 focus:ring-2 transition-all duration-200"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              value={conta.valor || ""}
                              onChange={(e) => atualizarContaReceber(conta.id, "valor", parseFloat(e.target.value) || 0)}
                              placeholder="0,00"
                              className="w-32 h-10 rounded-lg border-2 focus:ring-2 transition-all duration-200 font-semibold"
                            />
                          </td>
                          <td className="p-3">
                            <Select value={conta.status} onValueChange={(v) => atualizarContaReceber(conta.id, "status", v)}>
                              <SelectTrigger className={`w-32 h-10 rounded-lg border-2 font-medium ${getStatusColor(conta.status)}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Recebido">Recebido</SelectItem>
                                <SelectItem value="Pendente">Pendente</SelectItem>
                                <SelectItem value="Atrasado">Atrasado</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-3">
                            <Input
                              value={conta.formaRecebimento}
                              onChange={(e) => atualizarContaReceber(conta.id, "formaRecebimento", e.target.value)}
                              placeholder="PIX, Cartão..."
                              className="w-32 h-10 rounded-lg border-2 focus:ring-2 transition-all duration-200"
                            />
                          </td>
                          <td className="p-3">
                            <Button variant="destructive" size="sm" onClick={() => removerContaReceber(conta.id)} className="rounded-lg">
                              Excluir
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totalizadores */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total a Receber</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {totalReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Recebido</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {totalRecebido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Pendente</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {totalPendente.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FLUXO DE CAIXA */}
          <TabsContent value="fluxo" className="space-y-6">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Fluxo de Caixa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Saldo Inicial */}
                <div className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                  <label className="text-sm font-semibold text-muted-foreground mb-3 block">Saldo Inicial do Mês</label>
                  <Input
                    type="number"
                    value={saldoInicial || ""}
                    onChange={(e) => setSaldoInicial(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="max-w-xs h-12 text-lg font-bold rounded-xl border-2 focus:ring-4 transition-all duration-200"
                  />
                </div>

                {/* Resumo do Fluxo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl shadow-lg">
                    <p className="text-sm opacity-90 mb-2">Entradas (Recebimentos)</p>
                    <p className="text-3xl font-bold">{entradas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-xl shadow-lg">
                    <p className="text-sm opacity-90 mb-2">Saídas (Pagamentos)</p>
                    <p className="text-3xl font-bold">{saidas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  </div>
                </div>

                {/* Resultado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg">
                    <p className="text-sm opacity-90 mb-2">Resultado do Mês</p>
                    <p className="text-3xl font-bold">{resultadoMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                    <p className="text-xs opacity-80 mt-1">{resultadoMes >= 0 ? "Lucro" : "Prejuízo"}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-xl shadow-lg">
                    <p className="text-sm opacity-90 mb-2">Saldo Final</p>
                    <p className="text-3xl font-bold">{saldoFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                    <p className="text-xs opacity-80 mt-1">Saldo inicial + Entradas - Saídas</p>
                  </div>
                </div>

                {/* Detalhamento */}
                <div className="border-2 rounded-xl p-6 space-y-3 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                  <h3 className="font-semibold text-lg mb-4">Detalhamento do Fluxo</h3>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Saldo Inicial</span>
                    <span className="font-semibold">{saldoInicial.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b text-green-600 dark:text-green-400">
                    <span>+ Entradas (Recebimentos)</span>
                    <span className="font-semibold">{entradas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b text-red-600 dark:text-red-400">
                    <span>- Saídas (Pagamentos)</span>
                    <span className="font-semibold">{saidas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-lg px-4 mt-4">
                    <span className="font-bold text-lg">Saldo Final</span>
                    <span className="font-bold text-2xl text-purple-600 dark:text-purple-400">
                      {saldoFinal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
