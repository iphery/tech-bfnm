"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/utils/constant";
import { CustomModal } from "@/components/modal";
import { CommonInput } from "@/components/input";

const GROUP_OPTIONS = [
  { label: "Air Conditioner", value: "AC" },
  { label: "Apar", value: "AP" },
  { label: "Box Hidrant", value: "BH" },
  { label: "Forklift", value: "FK" },
  { label: "Genset", value: "GS" },
  { label: "Hidrant", value: "HY" },
  { label: "Kendaraan", value: "K" },
  { label: "Mesin Produksi", value: "MP" },
  { label: "Komputer", value: "PC" },
  { label: "Panel Listrik", value: "PN" },
];

const MAINTENANCE_BASED_OPTIONS = [
  { label: "Time Based", value: "Time" },
  { label: "KM Based", value: "KM" },
];

export default function ModalNewAsset({ isVisible, onClose, onSuccess }) {
  const [loadingInit, setLoadingInit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]);

  // Form states
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedBased, setSelectedBased] = useState("Time");

  // Inputs: 0: Deskripsi, 1: Manufacture, 2: Model, 3: No/Plat, 4: Tahun, 5: Lokasi
  const [inputs, setInputs] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isVisible) {
      loadFormData();
    } else {
      resetForm();
    }
  }, [isVisible]);

  const resetForm = () => {
    setSelectedGroup("");
    setSelectedCategory("");
    setSelectedUser("");
    setSelectedBased("Time");
    setInputs(["", "", "", "", "", ""]);
    setErrors({});
    setSubmitting(false);
  };

  const loadFormData = async () => {
    try {
      setLoadingInit(true);
      const res = await axios.get(`${API_URL}/datafornewasset`);
      if (res.data) {
        if (Array.isArray(res.data.category)) {
          setCategoryOptions(
            res.data.category.map((item) => ({
              value: item.label,
              label: item.label,
            }))
          );
        }
        if (Array.isArray(res.data.employee)) {
          setUserOptions(
            res.data.employee.map((item) => ({
              value: item.name,
              label: `${item.name} (${item.division || "Umum"})`,
              division: item.division,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Error loading asset dropdown data:", err);
    } finally {
      setLoadingInit(false);
    }
  };

  const updateInputVal = (index, val) => {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
    if (errors[`input_${index}`]) {
      setErrors((prev) => ({ ...prev, [`input_${index}`]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const newErrors = {};
    if (!selectedGroup) newErrors.group = "Group aset wajib dipilih";
    if (!selectedCategory) newErrors.category = "Group lokasi / kategori wajib dipilih";
    if (!inputs[0]?.trim()) newErrors.input_0 = "Deskripsi / nama aset wajib diisi";
    if (!inputs[1]?.trim()) newErrors.input_1 = "Manufacture / merk wajib diisi";
    if (!inputs[2]?.trim()) newErrors.input_2 = "Model / tipe wajib diisi";
    if (!inputs[3]?.trim()) newErrors.input_3 = "Nomor / seri / plat wajib diisi";
    if (!inputs[4]?.trim()) newErrors.input_4 = "Tahun perolehan / pembuatan wajib diisi";
    if (!inputs[5]?.trim()) newErrors.input_5 = "Lokasi penempatan aset wajib diisi";
    if (!selectedBased) newErrors.based = "Tipe maintenance wajib dipilih";
    if (!selectedUser) newErrors.user = "Penanggung jawab (User) wajib dipilih";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        group: selectedGroup,
        category: selectedCategory,
        user: selectedUser,
        based: selectedBased,
        data: inputs,
      };

      const res = await axios.post(`${API_URL}/createnewasset`, payload);
      if (res.status === 200 || res.data?.status === "success" || res.data?.status === 200) {
        // Jika maintenance based adalah KM, pastikan row KMbasedSchedule terbuat
        if (selectedBased === "KM") {
          try {
            // Ambil idAsset dari response backend jika ada, atau sinkronkan via query
            const createdId = res.data?.id_asset || res.data?.ID_Asset || res.data?.idAsset;
            if (createdId) {
              await axios.post("/api/registerkmbased", { idAsset: createdId });
            } else {
              // Jika backend PHP tidak mengembalikan ID, cari aset terbaru berdasar no / deskripsi
              const checkRes = await axios.get("/api/getallasset?limit=1&page=1");
              const latestAsset = checkRes.data?.data?.[0];
              if (latestAsset?.ID_Asset && latestAsset?.Based === "KM") {
                await axios.post("/api/registerkmbased", { idAsset: latestAsset.ID_Asset });
              }
            }
          } catch (kmErr) {
            console.error("Auto register KMbasedSchedule error:", kmErr);
          }
        }

        if (onSuccess) onSuccess();
        onClose();
      } else {
        alert(res.data?.message || "Gagal menyimpan aset baru.");
      }
    } catch (err) {
      console.error("Error creating new asset:", err);
      alert("Terjadi kesalahan saat menyimpan aset baru. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomModal
      isVisible={isVisible}
      isSmallWidth="md"
      title="Tambah Aset Baru"
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-xs text-body dark:text-bodydark pb-2 border-b border-stroke/60 dark:border-strokedark/60">
          Lengkapi data aset baru di bawah ini untuk didaftarkan ke dalam sistem.
        </p>

        {loadingInit ? (
          <div className="py-12 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
            <p className="mt-2 text-xs text-slate-400">Memuat data referensi...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Group Asset */}
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Group Aset <span className="text-danger">*</span>
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    if (errors.group) setErrors((prev) => ({ ...prev, group: "" }));
                  }}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-black outline-none transition dark:bg-boxdark dark:text-white ${
                    errors.group ? "border-danger" : "border-stroke dark:border-strokedark"
                  } focus:border-primary`}
                >
                  <option value="">-- Pilih Group Aset --</option>
                  {GROUP_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label} ({g.value})
                    </option>
                  ))}
                </select>
                {errors.group && (
                  <span className="mt-1 block text-[10px] text-danger">{errors.group}</span>
                )}
              </div>

              {/* Group Lokasi / Category */}
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Kategori / Lokasi <span className="text-danger">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
                  }}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-black outline-none transition dark:bg-boxdark dark:text-white ${
                    errors.category ? "border-danger" : "border-stroke dark:border-strokedark"
                  } focus:border-primary`}
                >
                  <option value="">-- Pilih Lokasi/Kategori --</option>
                  {categoryOptions.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="mt-1 block text-[10px] text-danger">{errors.category}</span>
                )}
              </div>
            </div>

            {/* Inputs 0: Deskripsi */}
            <div>
              <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                Deskripsi / Nama Aset <span className="text-danger">*</span>
              </label>
              <CommonInput
                placeholder="Contoh: Genset Komatsu 500 kVA, Toyota Avanza..."
                input={inputs[0]}
                onInputChange={(val) => updateInputVal(0, val)}
                error={!!errors.input_0}
                errorMessage={errors.input_0}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Inputs 1: Manufacture */}
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Manufacture / Merk <span className="text-danger">*</span>
                </label>
                <CommonInput
                  placeholder="Contoh: Komatsu, Daikin, Toyota..."
                  input={inputs[1]}
                  onInputChange={(val) => updateInputVal(1, val)}
                  error={!!errors.input_1}
                  errorMessage={errors.input_1}
                />
              </div>

              {/* Inputs 2: Model */}
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Model / Tipe <span className="text-danger">*</span>
                </label>
                <CommonInput
                  placeholder="Contoh: Inverter R32, 1.3 G M/T..."
                  input={inputs[2]}
                  onInputChange={(val) => updateInputVal(2, val)}
                  error={!!errors.input_2}
                  errorMessage={errors.input_2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Inputs 3: No / Plat */}
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  No Seri / No Plat <span className="text-danger">*</span>
                </label>
                <CommonInput
                  placeholder="Contoh: DK 1234 AA, SN-8921..."
                  input={inputs[3]}
                  onInputChange={(val) => updateInputVal(3, val)}
                  error={!!errors.input_3}
                  errorMessage={errors.input_3}
                />
              </div>

              {/* Inputs 4: Tahun */}
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Tahun Pembuatan <span className="text-danger">*</span>
                </label>
                <CommonInput
                  placeholder="Contoh: 2021"
                  input={inputs[4]}
                  onInputChange={(val) => updateInputVal(4, val)}
                  error={!!errors.input_4}
                  errorMessage={errors.input_4}
                />
              </div>

              {/* Inputs 5: Lokasi detail */}
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Lokasi / Ruangan <span className="text-danger">*</span>
                </label>
                <CommonInput
                  placeholder="Contoh: Ruang Panel, Garasi..."
                  input={inputs[5]}
                  onInputChange={(val) => updateInputVal(5, val)}
                  error={!!errors.input_5}
                  errorMessage={errors.input_5}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Tipe Maintenance */}
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  Tipe Maintenance <span className="text-danger">*</span>
                </label>
                <select
                  value={selectedBased}
                  onChange={(e) => {
                    setSelectedBased(e.target.value);
                    if (errors.based) setErrors((prev) => ({ ...prev, based: "" }));
                  }}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-black outline-none transition dark:bg-boxdark dark:text-white ${
                    errors.based ? "border-danger" : "border-stroke dark:border-strokedark"
                  } focus:border-primary`}
                >
                  {MAINTENANCE_BASED_OPTIONS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
                {errors.based && (
                  <span className="mt-1 block text-[10px] text-danger">{errors.based}</span>
                )}
              </div>

              {/* User / PIC */}
              <div>
                <label className="block text-[11px] font-semibold text-black dark:text-white mb-1">
                  User Penanggung Jawab <span className="text-danger">*</span>
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => {
                    setSelectedUser(e.target.value);
                    if (errors.user) setErrors((prev) => ({ ...prev, user: "" }));
                  }}
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-xs text-black outline-none transition dark:bg-boxdark dark:text-white ${
                    errors.user ? "border-danger" : "border-stroke dark:border-strokedark"
                  } focus:border-primary`}
                >
                  <option value="">-- Pilih Penanggung Jawab --</option>
                  {userOptions.map((u, idx) => (
                    <option key={`${u.value}-${idx}`} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
                {errors.user && (
                  <span className="mt-1 block text-[10px] text-danger">{errors.user}</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-stroke/60 dark:border-strokedark/60">
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="rounded-lg border border-stroke px-4 py-2 text-xs font-semibold text-black hover:bg-slate-100 disabled:opacity-50 dark:border-strokedark dark:text-white dark:hover:bg-boxdark-2"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="inline-flex items-center space-x-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                    <span>Menyimpan...</span>
                  </span>
                ) : (
                  "Simpan Aset"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </CustomModal>
  );
}
