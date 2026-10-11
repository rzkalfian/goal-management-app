"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "./request";

export function useResource(path) {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    request(path, { signal: controller.signal }).then((result) => {
      setData(result); setError("");
    }).catch((failure) => {
      if (failure.status === 401) router.replace("/login");
      if (!controller.signal.aborted) setError(failure.message);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, version, router]);
  function refresh() { setLoading(true); setVersion((value) => value + 1); }
  return { data, loading, error, refresh };
}