"use client";

import { useRouter } from "next/navigation";

export const goto = (path: string) => {
    const router = useRouter();
    router.push(path);
}