// アイコンURL → 衣装名（例: 「水着」）。基本のアイコンは登録しない。
const outfitByAvatar = new Map<string, string>()

export function registerOutfitAvatars(avatarUrl: string, outfit: string | undefined): void {
    if (outfit) outfitByAvatar.set(avatarUrl, outfit)
    else outfitByAvatar.delete(avatarUrl)
}

export function getOutfitForAvatar(avatarUrl: string | undefined | null): string {
    return (avatarUrl && outfitByAvatar.get(avatarUrl)) || ''
}
