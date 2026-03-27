import { useState } from "react";
import { UserProfile, TRACKER_DEF, DEFAULT_TRACKERS, OPTIONAL_TRACKERS } from "@/types";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Save, UserPlus, ArrowUp, ArrowDown, UserX, AlertTriangle } from "lucide-react";
import { usePartner } from "@/hooks/use-partner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsPanelProps {
  profile: UserProfile;
  onClose: () => void;
  onProfileUpdate: (partial: Partial<UserProfile>) => void;
}

export function SettingsPanel({ profile, onClose, onProfileUpdate }: SettingsPanelProps) {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(profile.enabledTrackers));
  const [order, setOrder] = useState<string[]>(profile.trackerOrder);
  const [customName, setCustomName] = useState(profile.customTrackerName);
  const [partnerEmail, setPartnerEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);
  const [unlinkStatus, setUnlinkStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const { linkPartnerByEmail, unlinkPartner, loading: partnerLoading, error: partnerError } =
    usePartner(null);

  const handleToggle = (key: string) => {
    const next = new Set(enabled);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setEnabled(next);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= order.length) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[index + direction]] = [
      newOrder[index + direction],
      newOrder[index],
    ];
    setOrder(newOrder);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const updates = {
        enabledTrackers: Array.from(enabled),
        trackerOrder: order,
        customTrackerName: customName,
      };
      await setDoc(doc(db, "users", profile.uid), updates, { merge: true });
      onProfileUpdate(updates);
      onClose();
    } catch (err) {
      console.error("Settings save failed:", err);
      alert("Couldn't save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPartner = async () => {
    if (!partnerEmail.trim()) return;
    const success = await linkPartnerByEmail(profile.uid, partnerEmail.trim());
    if (success) {
      setPartnerEmail("");
      // We can't get the partner ID here directly without a re-fetch,
      // so we just close and let auth refresh handle it
      alert("Partner linked! Refresh to see their dashboard.");
      onClose();
    }
  };

  const handleUnlinkConfirm = async () => {
    if (!profile.partnerId) return;
    setUnlinkStatus("loading");
    const success = await unlinkPartner(profile.uid, profile.partnerId);
    if (success) {
      setUnlinkStatus("success");
      // Optimistically update local profile
      onProfileUpdate({ partnerId: null });
      setTimeout(() => {
        setShowUnlinkConfirm(false);
        setUnlinkStatus("idle");
        onClose();
      }, 1200);
    } else {
      setUnlinkStatus("error");
      setTimeout(() => setUnlinkStatus("idle"), 3000);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card shadow-2xl border-l-2 border-border/50 flex flex-col"
      >
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-primary/5">
          <h2 className="text-2xl font-bold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 active:scale-95 transition-all"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Partner Section */}
          <section className="bg-secondary/20 p-5 rounded-3xl border border-secondary/30">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-secondary-foreground">
              <UserPlus className="w-5 h-5" /> Partner Link
            </h3>

            {profile.partnerId ? (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl shadow-sm text-center">
                  <p className="font-semibold text-emerald-600 mb-1">✓ Partner Linked</p>
                  <p className="text-sm text-muted-foreground">You are synced with your partner.</p>
                </div>
                <button
                  onClick={() => setShowUnlinkConfirm(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-destructive/10 text-destructive font-bold border border-destructive/20 hover:bg-destructive/20 active:scale-95 transition-all"
                >
                  <UserX className="w-4 h-4" />
                  Remove Partner
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Partner's email address"
                  value={partnerEmail}
                  onChange={(e) => setPartnerEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddPartner()}
                  className="w-full px-4 py-3 rounded-xl bg-white border-2 border-border focus:border-secondary focus:ring-4 focus:ring-secondary/20 outline-none transition-all"
                />
                {partnerError && (
                  <p className="text-destructive text-sm font-semibold">{partnerError}</p>
                )}
                <button
                  onClick={handleAddPartner}
                  disabled={partnerLoading || !partnerEmail.trim()}
                  className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80 active:scale-95 transition-all disabled:opacity-50"
                >
                  {partnerLoading ? "Searching…" : "Link Partner"}
                </button>
              </div>
            )}
          </section>

          {/* Rename Annoyance Tracker */}
          <section>
            <h3 className="font-bold text-lg mb-3 text-foreground">Rename Annoyance Tracker</h3>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Boss Annoyance, Rahul…"
              className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all font-semibold"
            />
          </section>

          {/* Manage Trackers */}
          <section>
            <h3 className="font-bold text-lg mb-1 text-foreground">Manage Trackers</h3>
            <p className="text-sm text-muted-foreground mb-4">Toggle visibility and reorder your cards.</p>
            <div className="space-y-2">
              {order.map((key, i) => {
                const def = TRACKER_DEF[key];
                if (!def) return null;
                const isAlwaysOn = key === "partnerAnnoyance";
                const isDefaultOn = DEFAULT_TRACKERS.includes(key);

                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-border/50"
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveItem(i, -1)}
                        disabled={i === 0}
                        className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveItem(i, 1)}
                        disabled={i === order.length - 1}
                        className="p-1 text-muted-foreground hover:text-primary disabled:opacity-30 transition-colors"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {key === "partnerAnnoyance" ? customName || def.label : def.label}
                      </p>
                      {isAlwaysOn && (
                        <p className="text-[10px] text-muted-foreground font-medium">Always on</p>
                      )}
                    </div>

                    <button
                      disabled={isAlwaysOn}
                      onClick={() => handleToggle(key)}
                      className={cn(
                        "relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0",
                        enabled.has(key) || isAlwaysOn ? "bg-primary" : "bg-border",
                        isAlwaysOn && "opacity-50 cursor-not-allowed"
                      )}
                      title={isAlwaysOn ? "Cannot disable" : undefined}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                          enabled.has(key) || isAlwaysOn ? "translate-x-6" : "translate-x-1"
                        )}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-border/50 bg-background">
          <button
            onClick={saveSettings}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-xl active:scale-95 transition-all disabled:opacity-70"
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>

      {/* Unlink Confirmation Modal */}
      <AnimatePresence>
        {showUnlinkConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
              onClick={() => unlinkStatus === "idle" && setShowUnlinkConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", damping: 24, stiffness: 300 }}
              className="fixed z-[60] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm mx-4 bg-card rounded-3xl shadow-2xl border-2 border-border/50 p-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground">Remove Partner?</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    Are you sure you want to remove your partner? You'll both return to
                    independent mode. Your existing logs and history won't be deleted.
                  </p>
                </div>

                {unlinkStatus === "success" && (
                  <p className="text-emerald-600 font-bold">Partner removed successfully ✓</p>
                )}
                {unlinkStatus === "error" && (
                  <p className="text-destructive font-semibold text-sm">
                    Something went wrong. Please try again.
                  </p>
                )}

                {unlinkStatus !== "success" && (
                  <div className="flex gap-3 w-full mt-2">
                    <button
                      onClick={() => setShowUnlinkConfirm(false)}
                      disabled={unlinkStatus === "loading"}
                      className="flex-1 py-3 rounded-2xl bg-secondary/30 text-secondary-foreground font-bold hover:bg-secondary/50 active:scale-95 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUnlinkConfirm}
                      disabled={unlinkStatus === "loading"}
                      className="flex-1 py-3 rounded-2xl bg-destructive text-destructive-foreground font-bold shadow-lg shadow-destructive/25 hover:bg-destructive/90 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {unlinkStatus === "loading" ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <UserX className="w-4 h-4" />
                      )}
                      {unlinkStatus === "loading" ? "Removing…" : "Yes, Remove"}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
