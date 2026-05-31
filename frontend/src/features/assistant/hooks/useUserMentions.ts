import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiSearchUsers } from "../../../apiClient";
import type { UserSummary } from "../../../entities/calendar";

/** Короткое отображаемое имя «Петрова А.С.» из полного ФИО. */
export function userMentionLabel(user: UserSummary): string {
  const parts = user.fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const initials = parts
      .slice(1)
      .map((part) => `${part.charAt(0).toUpperCase()}.`)
      .join("");
    return `${parts[0]} ${initials}`;
  }
  return user.fullName || user.nickname || user.email;
}

type UseUserMentionsArgs = {
  token: string;
  onSessionExpired: () => void;
  onTokenRefresh?: (token: string) => void;
  inputValueRef: React.MutableRefObject<string>;
  setInputValue: (v: string) => void;
  setAssistantQuery: (v: string) => void;
};

export type UseUserMentionsReturn = {
  userMentionTerm: string;
  setUserMentionTerm: (term: string) => void;
  userMentionCandidates: UserSummary[];
  userMentionActiveIndex: number;
  setUserMentionActiveIndex: (index: number) => void;
  clearUserMentions: () => void;
  attachUserMention: (user: UserSummary) => void;
};

/** Автодополнение упоминаний пользователей по триггеру `#` в поле ассистента. */
export function useUserMentions({
  token,
  onSessionExpired,
  onTokenRefresh,
  inputValueRef,
  setInputValue,
  setAssistantQuery,
}: UseUserMentionsArgs): UseUserMentionsReturn {
  const [userMentionTerm, setUserMentionTerm] = useState("");
  const [userMentionCandidates, setUserMentionCandidates] = useState<UserSummary[]>([]);
  const [userMentionActiveIndex, setUserMentionActiveIndex] = useState(-1);

  const mentionUsersQuery = useQuery({
    queryKey: ["assistant-mention-users", userMentionTerm],
    queryFn: () => apiSearchUsers(userMentionTerm, onSessionExpired, onTokenRefresh),
    enabled: !!token && userMentionTerm.length > 0,
  });

  useEffect(() => {
    if (!userMentionTerm || mentionUsersQuery.isError) {
      setUserMentionCandidates([]);
      setUserMentionActiveIndex(-1);
      return;
    }
    const candidates = mentionUsersQuery.data ?? [];
    setUserMentionCandidates(candidates);
    setUserMentionActiveIndex(candidates.length ? 0 : -1);
  }, [mentionUsersQuery.data, mentionUsersQuery.isError, userMentionTerm]);

  function clearUserMentions() {
    setUserMentionCandidates([]);
    setUserMentionActiveIndex(-1);
  }

  function attachUserMention(user: UserSummary) {
    const currentInput = inputValueRef.current;
    const mentionIndex = currentInput.lastIndexOf("#");
    if (mentionIndex < 0) return;
    const newValue = `${currentInput.slice(0, mentionIndex)}#${userMentionLabel(user)} `;
    setInputValue(newValue);
    setAssistantQuery(newValue);
    clearUserMentions();
    setUserMentionTerm("");
  }

  return {
    userMentionTerm,
    setUserMentionTerm,
    userMentionCandidates,
    userMentionActiveIndex,
    setUserMentionActiveIndex,
    clearUserMentions,
    attachUserMention,
  };
}
