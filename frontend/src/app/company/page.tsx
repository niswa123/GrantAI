"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { company as companyApi } from "@/lib/api/client";
import type { CreateCompanyDto } from "@/lib/api/types";
import { AppNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Building2, Loader2, Globe, TrendingUp, ChevronDown } from "lucide-react";

interface SupportedCountry {
  code: string;
  name: string;
  program: string;
  currency: string;
  baseCreditRate: number;
  notes: string;
}

export default function CompanyPage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: "",
    country: "",
    industry: "",
  });

  // Fetch company
  const { data: company, isLoading } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await companyApi.get();
      return response.data;
    },
  });

  // Fetch supported countries
  const { data: countries = [] } = useQuery<SupportedCountry[]>({
    queryKey: ["supported-countries"],
    queryFn: async () => {
      const response = await companyApi.supportedCountries();
      return response.data;
    },
    staleTime: Infinity, // static data, never refetch
  });

  const selectedCountry = countries.find((c) => c.code === formData.country);

  // Create company mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateCompanyDto) => companyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      setIsEditing(false);
    },
  });

  // Update company mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateCompanyDto>) => companyApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      setIsEditing(false);
    },
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formData.name.trim()) { setFormError("Company name is required."); return; }
    if (!formData.country) { setFormError("Please select a country."); return; }
    if (!formData.industry.trim()) { setFormError("Industry is required."); return; }

    if (company) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = () => {
    if (company) {
      setFormData({ name: company.name, country: company.country, industry: company.industry });
    }
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <AppNav />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <AppNav />
      <div className="container mx-auto px-4 max-w-4xl pt-32 pb-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Company Profile</h1>
              <p className="text-slate-400">Manage your company information</p>
            </div>
          </div>
        </div>

        {/* Company Card */}
        <Card className="bg-slate-900/50 border-cyan-500/20 p-8">
          {!company && !isEditing ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Company Yet</h2>
              <p className="text-slate-400 mb-6">Create your company profile to get started</p>
              <Button onClick={() => setIsEditing(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                Create Company
              </Button>
            </div>
          ) : isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Name */}
              <div>
                <Label htmlFor="name" className="text-white">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Acme Inc."
                  className="bg-slate-950 border-slate-700 text-white"
                />
              </div>

              {/* Country Selector */}
              <div>
                <Label className="text-white mb-2 block">Country & Tax Program</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-950 border border-slate-700 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors hover:border-slate-600"
                  >
                    {selectedCountry ? (
                      <div className="flex items-center gap-3">
                        <Globe className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <div>
                          <span className="text-white font-semibold">{selectedCountry.name}</span>
                          <span className="text-slate-500 text-sm ml-2">({selectedCountry.currency})</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500">Select a country...</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${countryDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {countryDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                      {countries.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, country: c.code });
                            setCountryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-800 last:border-0 ${
                            formData.country === c.code ? "bg-cyan-500/10" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-white font-semibold">{c.name}</span>
                              <p className="text-xs text-slate-400 mt-0.5">{c.program}</p>
                            </div>
                            <div className="text-right ml-4">
                              <span className="text-cyan-400 font-bold text-sm">
                                {(c.baseCreditRate * 100).toFixed(0)}%
                              </span>
                              <p className="text-xs text-slate-500">{c.currency}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected country info card */}
                {selectedCountry && (
                  <div className="mt-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-cyan-400 mb-1">{selectedCountry.program}</p>
                        <p className="text-xs text-slate-400">{selectedCountry.notes}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Base credit rate: <span className="text-white font-bold">{(selectedCountry.baseCreditRate * 100).toFixed(0)}%</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Industry */}
              <div>
                <Label htmlFor="industry" className="text-white">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="Software Development"
                  className="bg-slate-950 border-slate-700 text-white"
                />
              </div>

              {formError && (
                <p className="text-red-400 text-sm font-medium">{formError}</p>
              )}

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                  ) : company ? (
                    "Update Company"
                  ) : (
                    "Create Company"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsEditing(false); setFormError(null); }}
                  className="border-slate-700 text-white hover:bg-slate-800"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            // View mode
            <div className="space-y-6">
              <div>
                <Label className="text-slate-500">Company Name</Label>
                <p className="text-2xl font-bold text-white">{company?.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-500">Country</Label>
                  {(() => {
                    // Show country details if we have them
                    const countryInfo = countries.find(c => c.code === company?.country);
                    return countryInfo ? (
                      <div className="mt-1">
                        <p className="text-lg font-bold text-white">{countryInfo.name}</p>
                        <p className="text-xs text-cyan-400 mt-0.5">{countryInfo.program}</p>
                        <p className="text-xs text-slate-500">
                          {(countryInfo.baseCreditRate * 100).toFixed(0)}% base rate · {countryInfo.currency}
                        </p>
                      </div>
                    ) : (
                      <p className="text-lg text-white">{company?.country}</p>
                    );
                  })()}
                </div>
                <div>
                  <Label className="text-slate-500">Industry</Label>
                  <p className="text-lg text-white">{company?.industry}</p>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleEdit} className="bg-cyan-500 hover:bg-cyan-600 text-white">
                  Edit Company
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
