import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { 
  FileSpreadsheet, Upload, Download, AlertCircle, 
  X, Copy, CheckCircle2, ArrowRight
} from 'lucide-react';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

interface CandidateImportItem {
  id: number;
  name: string;
  selected: boolean;
}

interface ImportedResultItem {
  name: string;
  position: string;
  department: string;
  link: string;
  token: string;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccess
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'complete'>('upload');
  const [candidatesList, setCandidatesList] = useState<CandidateImportItem[]>([]);
  const [defaultPosition, setDefaultPosition] = useState('Operador de Atendimento');
  const [defaultDepartment, setDefaultDepartment] = useState('Operações');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Progress state
  const [progressCount, setProgressCount] = useState(0);
  const [totalToImport, setTotalToImport] = useState(0);

  // Results state
  const [importedResults, setImportedResults] = useState<ImportedResultItem[]>([]);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedLinksOnly, setCopiedLinksOnly] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setStep('upload');
    setCandidatesList([]);
    setErrorMsg(null);
    setProgressCount(0);
    setTotalToImport(0);
    setImportedResults([]);
    setCopiedAll(false);
    setCopiedLinksOnly(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Download Sample Template Excel
  const handleDownloadSample = () => {
    const sampleData = [
      { "Nome do Candidato": "Ana Paula Souza" },
      { "Nome do Candidato": "Bruno Henrique Lima" },
      { "Nome do Candidato": "Carla Fernandez Silva" },
      { "Nome do Candidato": "Diego Ramos Costa" }
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidatos");
    XLSX.writeFile(workbook, "Modelo_Importacao_Candidatos_Azevedo.xlsx");
  };

  // Parse Excel / CSV File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = (fileToRead: File) => {
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        if (!workbook.SheetNames.length) {
          throw new Error('A planilha está vazia ou corrompida.');
        }

        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('Nenhum dado encontrado na planilha.');
        }

        // Find candidate name column
        let nameColIdx = 0;
        let startRow = 0;

        // Check first row for column header matching "nome", "candidato", "name"
        const firstRow = rawJson[0];
        if (Array.isArray(firstRow)) {
          const headerIdx = firstRow.findIndex(cell => 
            typeof cell === 'string' && /nome|candidato|name/i.test(cell.trim())
          );
          if (headerIdx !== -1) {
            nameColIdx = headerIdx;
            startRow = 1; // skip header row
          } else {
            // Check if first cell looks like header
            if (typeof firstRow[0] === 'string' && /nome|candidato|name/i.test(firstRow[0].trim())) {
              startRow = 1;
            }
          }
        }

        const extractedNames: string[] = [];
        for (let i = startRow; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (Array.isArray(row) && row[nameColIdx] !== undefined && row[nameColIdx] !== null) {
            const rawVal = String(row[nameColIdx]).trim();
            if (rawVal && !/nome|candidato|name/i.test(rawVal)) {
              extractedNames.push(rawVal);
            }
          }
        }

        if (extractedNames.length === 0) {
          throw new Error('Nenhum nome de candidato foi identificado na coluna da planilha.');
        }

        const formattedItems: CandidateImportItem[] = extractedNames.map((name, index) => ({
          id: index + 1,
          name,
          selected: true
        }));

        setCandidatesList(formattedItems);
        setStep('preview');
      } catch (err: any) {
        console.error('Erro ao ler Excel:', err);
        setErrorMsg(err.message || 'Falha ao processar arquivo. Verifique o formato do arquivo.');
      }
    };

    reader.onerror = () => {
      setErrorMsg('Erro ao ler o arquivo selecionado.');
    };

    reader.readAsArrayBuffer(fileToRead);
  };

  // Toggle selection
  const toggleSelectAll = () => {
    const allSelected = candidatesList.every(c => c.selected);
    setCandidatesList(prev => prev.map(c => ({ ...c, selected: !allSelected })));
  };

  const toggleCandidateSelect = (id: number) => {
    setCandidatesList(prev => prev.map(c => c.id === id ? { ...c, selected: !c.selected } : c));
  };

  const updateCandidateName = (id: number, newName: string) => {
    setCandidatesList(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  // Execute Batch Import
  const handleExecuteImport = async () => {
    const selectedItems = candidatesList.filter(c => c.selected && c.name.trim() !== '');
    if (selectedItems.length === 0) {
      setErrorMsg('Selecione pelo menos um candidato válido para importar.');
      return;
    }

    setStep('importing');
    setTotalToImport(selectedItems.length);
    setProgressCount(0);
    setErrorMsg(null);

    const createdResults: ImportedResultItem[] = [];

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      try {
        // 1. Create Candidate
        const { data: candidateData, error: candErr } = await supabase
          .from('candidates')
          .insert({
            name: item.name.trim(),
            position: defaultPosition.trim() || 'Operador de Atendimento',
            department: defaultDepartment.trim() || 'Operações',
            recruiter_id: userId
          })
          .select()
          .single();

        if (candErr) throw candErr;

        // 2. Create Assessment
        const { data: assessData, error: assessErr } = await supabase
          .from('assessments')
          .insert({
            candidate_id: candidateData.id,
            recruiter_id: userId,
            status: 'pending',
            scoring_version: 'b5cx_v1'
          })
          .select()
          .single();

        if (assessErr) throw assessErr;

        const fullLink = `${window.location.origin}${window.location.pathname}?token=${assessData.access_token}`;

        createdResults.push({
          name: candidateData.name,
          position: candidateData.position || defaultPosition,
          department: candidateData.department || defaultDepartment,
          link: fullLink,
          token: assessData.access_token
        });

      } catch (err) {
        console.error(`Erro ao importar candidato ${item.name}:`, err);
      } finally {
        setProgressCount(i + 1);
      }
    }

    setImportedResults(createdResults);
    setStep('complete');
    onSuccess();
  };

  // Copy helper
  const handleCopyAll = () => {
    const textLines = importedResults.map(r => `${r.name}: ${r.link}`).join('\n');
    navigator.clipboard.writeText(textLines);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const handleCopyLinksOnly = () => {
    const textLines = importedResults.map(r => r.link).join('\n');
    navigator.clipboard.writeText(textLines);
    setCopiedLinksOnly(true);
    setTimeout(() => setCopiedLinksOnly(false), 3000);
  };

  // Export Results back to Excel with generated links
  const handleExportResultsExcel = () => {
    const exportData = importedResults.map(r => ({
      "Nome do Candidato": r.name,
      "Cargo": r.position,
      "Departamento": r.department,
      "Link de Avaliação": r.link,
      "Token de Acesso": r.token
    }));
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Links Gerados");
    XLSX.writeFile(workbook, "Candidatos_Com_Links_Azevedo.xlsx");
  };

  const selectedCount = candidatesList.filter(c => c.selected).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 dark:border-slate-800 rounded-3xl max-w-2xl w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 dark:bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 dark:text-slate-100">Importar Candidatos via Excel</h2>
              <p className="text-xs text-slate-400 dark:text-slate-400">Cadastre múltiplos candidatos em segundos com uma planilha simples</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-950/40 hover:bg-slate-950/80 rounded-3xl p-8 text-center transition-all cursor-pointer group flex flex-col items-center justify-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-1">
                  Arraste e solte sua planilha aqui
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Suporta arquivos Excel (.xlsx, .xls) e CSV contendo coluna de nomes
                </p>
                <span className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-medium border border-slate-700 transition-colors">
                  Selecionar Arquivo
                </span>
              </div>

              {/* Sample Template Box */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-300">Precisa de um modelo pronto?</h4>
                  <p className="text-[11px] text-slate-400">Baixe nossa planilha de exemplo contendo apenas a coluna de nomes.</p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSample}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Modelo</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Preview & Select */}
          {step === 'preview' && (
            <div className="space-y-5">
              
              {/* Default Position & Department Config */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cargo Padrão</label>
                  <input
                    type="text"
                    value={defaultPosition}
                    onChange={(e) => setDefaultPosition(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="Ex: Operador de Atendimento"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Departamento Padrão</label>
                  <input
                    type="text"
                    value={defaultDepartment}
                    onChange={(e) => setDefaultDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    placeholder="Ex: Operações"
                  />
                </div>
              </div>

              {/* Table Header Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">
                    Candidatos Encontrados ({candidatesList.length})
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {selectedCount} selecionado(s)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  {candidatesList.every(c => c.selected) ? 'Desmarcar Todos' : 'Marcar Todos'}
                </button>
              </div>

              {/* Candidates List Box */}
              <div className="border border-slate-800 rounded-2xl bg-slate-950/40 max-h-60 overflow-y-auto divide-y divide-slate-800/60">
                {candidatesList.map((item) => (
                  <div key={item.id} className="p-3 flex items-center gap-3 hover:bg-slate-800/30 transition-colors">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleCandidateSelect(item.id)}
                      className="w-4 h-4 rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900 cursor-pointer"
                    />
                    <span className="text-xs text-slate-500 font-mono w-6">{item.id}.</span>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateCandidateName(item.id, e.target.value)}
                      className="flex-1 bg-transparent border-b border-transparent focus:border-slate-700 text-xs text-slate-200 focus:outline-none px-1 py-0.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Importing Progress */}
          {step === 'importing' && (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin mx-auto"></div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Importando Candidatos...</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Cadastrando candidatos e gerando tokens de avaliação ({progressCount} / {totalToImport})
                </p>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 max-w-xs mx-auto overflow-hidden border border-slate-800">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${(progressCount / (totalToImport || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* STEP 4: Complete & Results */}
          {step === 'complete' && (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">Importação Concluída com Sucesso!</h4>
                  <p className="text-[11px] text-emerald-400/80">
                    {importedResults.length} candidato(s) foram cadastrados e possuem links individuais de avaliação.
                  </p>
                </div>
              </div>

              {/* Action Bar for Copy & Export */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedAll ? 'Copiado para a Área de Transferência!' : 'Copiar Nomes + Links'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLinksOnly}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 px-4 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedLinksOnly ? 'Copiado!' : 'Copiar Apenas Links'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportResultsExcel}
                  className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 py-2.5 px-4 rounded-xl text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
                  title="Exportar tabela de links em Excel"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar Excel</span>
                </button>
              </div>

              {/* Results Table */}
              <div className="border border-slate-800 rounded-2xl bg-slate-950/40 max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                {importedResults.map((r, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-200 truncate">{r.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{r.link}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(r.link);
                        alert(`Link de ${r.name} copiado!`);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium border border-slate-700 shrink-0 cursor-pointer"
                    >
                      Copiar Link
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-950 dark:bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          {step === 'preview' ? (
            <>
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={selectedCount === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Importar {selectedCount} Candidato(s)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : step === 'complete' ? (
            <button
              type="button"
              onClick={handleClose}
              className="ml-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              Concluir
            </button>
          ) : (
            <button
              type="button"
              onClick={handleClose}
              className="ml-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer"
            >
              Cancelar
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
