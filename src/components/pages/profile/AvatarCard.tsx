// src/components/pages/profile/AvatarCard.tsx

type Props = {
    loadingMe: boolean;
    name: string;
    email: string;
};

export function AvatarCard({loadingMe, name, email}: Props) {
    return (
        <div className="flex items-center gap-6 p-6 rounded-2xl bg-card border border-border">
            <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center">
        <span className="font-display text-3xl font-bold text-primary-foreground">
          {(name?.charAt(0) || "U").toUpperCase()}
        </span>
            </div>

            <div>
                <h2 className="font-display text-lg font-semibold">
                    {loadingMe ? "Loading..." : name || "User"}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {loadingMe ? "" : email || "user@example.com"}
                </p>
            </div>
        </div>
    );
}