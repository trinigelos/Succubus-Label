"use client";

import { getAdminCategories } from "@/lib/data/admin";
import type { Category } from "@/lib/types";
import { useEffect, useState } from "react";
import { NewProductForm } from "./NewProductForm";

export default function NewProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getAdminCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  return <NewProductForm initialCategories={categories} />;
}
