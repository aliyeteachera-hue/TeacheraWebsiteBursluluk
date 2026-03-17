# Git Remote Hardening Note

Bu repo için yanlış remote'a push riskini azaltmak adına standart:

1. Tek canonical remote: `origin`
2. `origin` fetch/push URL:
   - `https://github.com/aliyeteachera-hue/TeacheraWebsiteBursluluk.git`
3. Push varsayılanı:
   - `remote.pushDefault=origin`
   - `push.default=simple`
4. Ek/alias remote kullanılmaz (gerektiğinde geçici eklenir, iş bitince silinir).
5. Push öncesi hızlı doğrulama:
   - `git remote -v`
   - `git branch --show-current`
   - `git push origin <branch>`

## Uygulanan Komutlar

```bash
git remote set-url origin https://github.com/aliyeteachera-hue/TeacheraWebsiteBursluluk.git
git remote set-url --push origin https://github.com/aliyeteachera-hue/TeacheraWebsiteBursluluk.git
git config --local remote.pushDefault origin
git config --local push.default simple
git remote remove TeacheraWebsiteBursluluk
```

## Durum Kontrol

```bash
git remote -v
git config --local --get remote.pushDefault
git config --local --get push.default
```
