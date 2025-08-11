import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Send, Check, Clock, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertLeadSchema, type InsertLead } from "@shared/schema";
import ProgressBar from "./ProgressBar";

const steps = [
  { id: 1, label: "Empresa" },
  { id: 2, label: "Desafios" },
  { id: 3, label: "Soluções" },
  { id: 4, label: "Contato" }
];

const challenges = [
  { value: "atendimento", label: "Atendimento ao Cliente", description: "Demora nas respostas, falta de disponibilidade 24/7" },
  { value: "processos", label: "Processos Manuais", description: "Tarefas repetitivas consumindo muito tempo" },
  { value: "dados", label: "Análise de Dados", description: "Dificuldade para extrair insights dos dados" },
  { value: "custos", label: "Controle de Custos", description: "Falta de visibilidade sobre gastos operacionais" },
  { value: "comunicacao", label: "Comunicação Interna", description: "Dificuldade na coordenação entre equipes" },
  { value: "escalabilidade", label: "Escalabilidade", description: "Dificuldade para crescer sem aumentar custos proporcionalmente" }
];

const solutions = [
  {
    value: "chatbot-advanced",
    icon: "🤖",
    title: "Chatbots Avançados com RAG",
    description: "Assistentes virtuais inteligentes que usam seus próprios documentos e dados para responder perguntas complexas com precisão.",
    tags: ["24/7 Disponível", "Conhecimento Próprio", "Multi-plataforma"],
    color: "blue"
  },
  {
    value: "audio-ai",
    icon: "🎤",
    title: "IA com Envio de Áudio",
    description: "Respostas em voz natural da IA, permitindo interações mais humanas e acessíveis para seus clientes.",
    tags: ["Voz Natural", "Acessibilidade", "Experiência Premium"],
    color: "green"
  },
  {
    value: "data-analysis",
    icon: "📊",
    title: "Análise de Dados com IA",
    description: "Transforme seus dados em insights acionáveis com análises automatizadas e relatórios inteligentes.",
    tags: ["Insights Automáticos", "Relatórios Visuais", "Previsões"],
    color: "purple"
  },
  {
    value: "automation",
    icon: "⚙️",
    title: "Automação de Processos",
    description: "Elimine tarefas repetitivas e otimize fluxos de trabalho com automações personalizadas para seu negócio.",
    tags: ["Economia de Tempo", "Menos Erros", "Escalabilidade"],
    color: "orange"
  }
];

export default function LeadForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertLead>({
    resolver: zodResolver(insertLeadSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      companyName: "",
      industry: "",
      companySize: "",
      position: "",
      challenges: [],
      mainChallenge: "",
      impactLevel: "",
      interestedSolutions: [],
      motivation: "",
      fullName: "",
      email: "",
      phone: "",
      preferredTime: "",
      budget: "",
      urgency: "",
      comments: ""
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertLead) => {
      const response = await apiRequest("POST", "/api/leads", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        variant: "success" as any,
        title: "Formulário enviado com sucesso!",
        description: "Nossa equipe entrará em contato em breve.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar formulário",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  });

  const validateStep = (step: number): boolean => {
    const values = form.getValues();
    
    switch (step) {
      case 1:
        return !!(values.companyName && values.industry && values.companySize && values.position);
      case 2:
        return !!(values.challenges && values.challenges.length > 0); // At least one challenge required
      case 3:
        return true; // Optional step
      case 4:
        return !!(values.fullName && values.email && values.phone);
      default:
        return true;
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof InsertLead)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ["companyName", "industry", "companySize", "position"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["challenges"];
    } else if (currentStep === 4) {
      fieldsToValidate = ["fullName", "email", "phone"];
    }
    
    // Trigger validation for specific fields
    const isValid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;
    
    if (isValid && validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      setShowErrors(false); // Reset error display when moving to next step
    } else {
      setShowErrors(true);
      if (fieldsToValidate.length > 0) {
        await form.trigger(fieldsToValidate);
      }
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: InsertLead) => {
    setShowErrors(true);
    const isValid = await form.trigger();
    if (isValid) {
      submitMutation.mutate(data);
    }
  };

  if (isSubmitted) {
    return (
      <div className="animate-fade-in text-center" data-testid="success-message">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Obrigado pelo seu interesse!</h2>
          <p className="text-gray-300 text-lg mb-6">Recebemos suas informações e nossa equipe entrará em contato em breve.</p>
        </div>
        <Card className="bg-dark-tertiary border-dark-quaternary">
          <CardContent className="p-6 text-left">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Clock className="mr-2 text-primary" />
              Próximos Passos
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">1</span>
                <span>Nossa equipe analisará suas necessidades e preparará uma proposta personalizada</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">2</span>
                <span>Entraremos em contato em até 24 horas para agendar uma conversa</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">3</span>
                <span>Apresentaremos um plano detalhado de implementação das soluções de IA</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        <div className="mt-8 p-4 bg-primary bg-opacity-10 border border-primary border-opacity-20 rounded-lg">
          <p className="flex items-center justify-center text-[#ebeb67]">
            <Lightbulb className="mr-2" />
            <strong>Dica:</strong> Enquanto aguarda nosso contato, que tal conhecer mais sobre nossas soluções em nosso site?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="lead-form">
      <ProgressBar currentStep={currentStep} totalSteps={4} steps={steps} />
      <Card className="bg-dark-secondary border-dark-tertiary shadow-2xl">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="animate-fade-in" data-testid="step-1">
                <div className="text-center mb-6 sm:mb-8">
                  <TypingAnimation 
                    text="Vamos conhecer sua empresa" 
                    className="text-2xl sm:text-3xl font-bold text-white mb-3"
                    duration={100}
                  />
                  <p className="text-gray-300 text-base sm:text-lg px-2">Compartilhe informações básicas sobre seu negócio para personalizarmos nossa conversa.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="sm:col-span-2">
                    <Label htmlFor="companyName" className="text-gray-300">Nome da Empresa *</Label>
                    <Input
                      id="companyName"
                      placeholder="Ex: TechCorp Ltda"
                      className="bg-dark-tertiary border-dark-quaternary text-white"
                      {...form.register("companyName")}
                      data-testid="input-company-name"
                    />
                    {showErrors && form.formState.errors.companyName && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.companyName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="industry" className="text-gray-300">Setor de Atuação *</Label>
                    <Select value={form.watch("industry") || ""} onValueChange={(value) => {
                      form.setValue("industry", value);
                      form.trigger("industry");
                    }}>
                      <SelectTrigger className="bg-dark-tertiary border-dark-quaternary text-white" data-testid="select-industry">
                        <SelectValue placeholder="Selecione o setor" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-tertiary border-dark-quaternary">
                        <SelectItem value="tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="direito">Advocacia</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                        <SelectItem value="educacao">Educação</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="varejo">Varejo/E-commerce</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="imobiliario">Imobiliário</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    {showErrors && form.formState.errors.industry && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.industry.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companySize" className="text-gray-300">Porte da Empresa *</Label>
                    <Select value={form.watch("companySize") || ""} onValueChange={(value) => {
                      form.setValue("companySize", value);
                      form.trigger("companySize");
                    }}>
                      <SelectTrigger className="bg-dark-tertiary border-dark-quaternary text-white" data-testid="select-company-size">
                        <SelectValue placeholder="Selecione o porte" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-tertiary border-dark-quaternary">
                        <SelectItem value="micro">Microempresa (até 9 funcionários)</SelectItem>
                        <SelectItem value="pequena">Pequena (10-49 funcionários)</SelectItem>
                        <SelectItem value="media">Média (50-249 funcionários)</SelectItem>
                        <SelectItem value="grande">Grande (250+ funcionários)</SelectItem>
                      </SelectContent>
                    </Select>
                    {showErrors && form.formState.errors.companySize && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.companySize.message}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="position" className="text-gray-300">Seu Cargo na Empresa *</Label>
                    <Input
                      id="position"
                      placeholder="Ex: CEO, CTO, Gerente de TI, etc."
                      className="bg-dark-tertiary border-dark-quaternary text-white"
                      {...form.register("position")}
                      data-testid="input-position"
                    />
                    {showErrors && form.formState.errors.position && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.position.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Challenges */}
            {currentStep === 2 && (
              <div className="animate-fade-in" data-testid="step-2">
                <div className="text-center mb-6 sm:mb-8">
                  <TypingAnimation 
                    text="Quais são seus principais desafios?" 
                    className="text-2xl sm:text-3xl font-bold text-white mb-3"
                    duration={80}
                  />
                  <p className="text-gray-300 text-base sm:text-lg px-2">Entender suas dificuldades atuais nos ajuda a propor as melhores soluções.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="text-gray-300 mb-3 block">Selecione os desafios que mais impactam seu negócio:</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {challenges.map((challenge) => (
                        <div 
                          key={challenge.value} 
                          className="flex items-start space-x-3 p-4 bg-dark-tertiary rounded-lg border border-dark-quaternary hover:border-primary hover:bg-dark-tertiary/80 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
                          onClick={() => {
                            const current = form.getValues("challenges") || [];
                            const checkbox = document.getElementById(challenge.value) as HTMLInputElement;
                            if (current.includes(challenge.value)) {
                              form.setValue("challenges", current.filter(c => c !== challenge.value));
                              checkbox.checked = false;
                            } else {
                              form.setValue("challenges", [...current, challenge.value]);
                              checkbox.checked = true;
                            }
                            form.trigger("challenges");
                          }}
                        >
                          <Checkbox
                            id={challenge.value}
                            value={challenge.value}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("challenges") || [];
                              if (checked) {
                                form.setValue("challenges", [...current, challenge.value]);
                              } else {
                                form.setValue("challenges", current.filter(c => c !== challenge.value));
                              }
                              form.trigger("challenges");
                            }}
                            className="mt-1"
                            data-testid={`checkbox-challenge-${challenge.value}`}
                          />
                          <div className="flex-1">
                            <Label htmlFor={challenge.value} className="text-white font-medium cursor-pointer group-hover:text-primary transition-colors duration-300">
                              {challenge.label}
                            </Label>
                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors duration-300">{challenge.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {showErrors && form.formState.errors.challenges && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.challenges.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="mainChallenge" className="text-gray-300">Descreva seu principal desafio atual (opcional)</Label>
                    <Textarea
                      id="mainChallenge"
                      placeholder="Ex: Nosso atendimento ao cliente está sobrecarregado e precisamos automatizar as respostas mais frequentes..."
                      className="bg-dark-tertiary border-dark-quaternary text-white h-24 resize-none"
                      {...form.register("mainChallenge")}
                      data-testid="textarea-main-challenge"
                    />
                  </div>

                  <div>
                    <Label htmlFor="impactLevel" className="text-gray-300">Qual o impacto desses desafios no seu negócio?</Label>
                    <Select value={form.watch("impactLevel") || ""} onValueChange={(value) => form.setValue("impactLevel", value)}>
                      <SelectTrigger className="bg-dark-tertiary border-dark-quaternary text-white" data-testid="select-impact-level">
                        <SelectValue placeholder="Selecione o nível de impacto" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-tertiary border-dark-quaternary">
                        <SelectItem value="baixo">Baixo - Pequenos incômodos ocasionais</SelectItem>
                        <SelectItem value="medio">Médio - Afeta produtividade regularmente</SelectItem>
                        <SelectItem value="alto">Alto - Impacta significativamente os resultados</SelectItem>
                        <SelectItem value="critico">Crítico - Ameaça o crescimento do negócio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Solutions */}
            {currentStep === 3 && (
              <div className="animate-fade-in" data-testid="step-3">
                <div className="text-center mb-6 sm:mb-8">
                  <TypingAnimation 
                    text="Conheça nossas soluções" 
                    className="text-2xl sm:text-3xl font-bold text-white mb-3"
                    duration={90}
                  />
                  <p className="text-gray-300 text-base sm:text-lg px-2">Marque as soluções que mais despertam seu interesse.</p>
                </div>

                <div className="space-y-6">
                  {solutions.map((solution) => (
                    <Card 
                      key={solution.value} 
                      className="bg-dark-tertiary border-dark-quaternary hover:border-primary hover:bg-dark-tertiary/80 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.01] transition-all duration-300 cursor-pointer group"
                      onClick={() => {
                        const current = form.getValues("interestedSolutions") || [];
                        const checkbox = document.getElementById(solution.value) as HTMLInputElement;
                        if (current.includes(solution.value)) {
                          form.setValue("interestedSolutions", current.filter(s => s !== solution.value));
                          checkbox.checked = false;
                        } else {
                          form.setValue("interestedSolutions", [...current, solution.value]);
                          checkbox.checked = true;
                        }
                      }}
                      data-testid={`solution-card-${solution.value}`}
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start space-x-4">
                          <Checkbox
                            id={solution.value}
                            value={solution.value}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("interestedSolutions") || [];
                              if (checked) {
                                form.setValue("interestedSolutions", [...current, solution.value]);
                              } else {
                                form.setValue("interestedSolutions", current.filter(s => s !== solution.value));
                              }
                            }}
                            className="mt-1"
                            data-testid={`checkbox-solution-${solution.value}`}
                          />
                          <div className="flex-grow">
                            <Label htmlFor={solution.value} className="block text-lg font-semibold text-white mb-2 cursor-pointer group-hover:text-primary transition-colors duration-300">
                              <span className="mr-2">{solution.icon}</span>
                              {solution.title}
                            </Label>
                            <p className="text-gray-300 mb-3 group-hover:text-gray-200 transition-colors duration-300">{solution.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {solution.tags.map((tag) => (
                                <span 
                                  key={tag}
                                  className="px-3 py-1 rounded-full text-sm text-[#e6e8ec] bg-[#396e3e]"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div>
                    <Label htmlFor="motivation" className="text-gray-300">Qual é sua principal motivação para implementar IA? (opcional)</Label>
                    <Textarea
                      id="motivation"
                      placeholder="Ex: Queremos reduzir custos operacionais, melhorar a experiência do cliente, ganhar vantagem competitiva..."
                      className="bg-dark-tertiary border-dark-quaternary text-white h-24 resize-none"
                      {...form.register("motivation")}
                      data-testid="textarea-motivation"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Contact */}
            {currentStep === 4 && (
              <div className="animate-fade-in" data-testid="step-4">
                <div className="text-center mb-6 sm:mb-8">
                  <TypingAnimation 
                    text="Como podemos entrar em contato?" 
                    className="text-2xl sm:text-3xl font-bold text-white mb-3"
                    duration={85}
                  />
                  <p className="text-gray-300 text-base sm:text-lg px-2">Compartilhe seus dados para agendarmos uma conversa personalizada.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="fullName" className="text-gray-300">Nome Completo *</Label>
                    <Input
                      id="fullName"
                      placeholder="Seu nome completo"
                      className="bg-dark-tertiary border-dark-quaternary text-white"
                      {...form.register("fullName")}
                      data-testid="input-full-name"
                    />
                    {showErrors && form.formState.errors.fullName && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">E-mail Corporativo *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nome@empresa.com"
                      className="bg-dark-tertiary border-dark-quaternary text-white"
                      {...form.register("email")}
                      data-testid="input-email"
                    />
                    {showErrors && form.formState.errors.email && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-300">Telefone/WhatsApp *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(83) 9 9999-9999"
                      className="bg-dark-tertiary border-dark-quaternary text-white"
                      {...form.register("phone")}
                      data-testid="input-phone"
                    />
                    {showErrors && form.formState.errors.phone && (
                      <p className="text-red-400 text-sm mt-1">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="preferredTime" className="text-gray-300">Melhor Horário para Contato</Label>
                    <Select value={form.watch("preferredTime") || ""} onValueChange={(value) => form.setValue("preferredTime", value)}>
                      <SelectTrigger className="bg-dark-tertiary border-dark-quaternary text-white" data-testid="select-preferred-time">
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-tertiary border-dark-quaternary">
                        <SelectItem value="manha">Manhã (8h às 12h)</SelectItem>
                        <SelectItem value="tarde">Tarde (12h às 18h)</SelectItem>
                        <SelectItem value="noite">Noite (18h às 22h)</SelectItem>
                        <SelectItem value="flexivel">Horário flexível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="budget" className="text-gray-300">Orçamento Aproximado para Implementação</Label>
                    <Select value={form.watch("budget") || ""} onValueChange={(value) => form.setValue("budget", value)}>
                      <SelectTrigger className="bg-dark-tertiary border-dark-quaternary text-white" data-testid="select-budget">
                        <SelectValue placeholder="Selecione uma faixa (opcional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-tertiary border-dark-quaternary">
                        <SelectItem value="1k5-4k">R$ 1.500 a R$ 4.000</SelectItem>
                        <SelectItem value="5k-15k">R$ 5.000 a R$ 15.000</SelectItem>
                        <SelectItem value="15k-30k">R$ 15.000 a R$ 30.000</SelectItem>
                        <SelectItem value="30k-mais">Acima de R$ 30.000</SelectItem>
                        <SelectItem value="sem-limite">Sem limite definido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-gray-300 mb-3 block">Urgência para Implementação</Label>
                    <RadioGroup
                      value={form.watch("urgency") || ""}
                      onValueChange={(value) => form.setValue("urgency", value)}
                      className="flex flex-wrap gap-4"
                      data-testid="radio-urgency"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="imediata" id="imediata" />
                        <Label htmlFor="imediata" className="text-white cursor-pointer">Imediata (até 1 mês)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="curto-prazo" id="curto-prazo" />
                        <Label htmlFor="curto-prazo" className="text-white cursor-pointer">Curto prazo (1-3 meses)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="medio-prazo" id="medio-prazo" />
                        <Label htmlFor="medio-prazo" className="text-white cursor-pointer">Médio prazo (3-6 meses)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exploratorio" id="exploratorio" />
                        <Label htmlFor="exploratorio" className="text-white cursor-pointer">Exploratório</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="comments" className="text-gray-300">Comentários Adicionais (opcional)</Label>
                    <Textarea
                      id="comments"
                      placeholder="Compartilhe qualquer informação adicional que considere importante..."
                      className="bg-dark-tertiary border-dark-quaternary text-white h-24 resize-none"
                      {...form.register("comments")}
                      data-testid="textarea-comments"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-6 sm:mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`${currentStep === 1 ? "invisible" : ""} bg-dark-quaternary text-gray-300 border-dark-quaternary hover:bg-gray-600`}
                data-testid="button-previous"
              >
                <ChevronLeft className="mr-2 w-4 h-4" />
                Anterior
              </Button>

              <div className="flex space-x-4">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-next"
                  >
                    Próximo
                    <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="mr-2 w-4 h-4" />
                        Enviar
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
