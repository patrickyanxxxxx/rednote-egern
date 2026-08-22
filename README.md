# RedNote Egern Ad Blocker

Egern module for RedNote (international Xiaohongshu), tested against network metadata from RedNote 9.44.

## Remote module URL

```text
https://raw.githubusercontent.com/patrickyanxxxxx/rednote-egern/main/RedNote_Remove_Ads.yaml
```

Add this URL in Egern as a remote module, enable MITM, and make sure the Egern CA certificate is installed and trusted.

## Features

- Filters explicitly marked feed and search advertisements
- Removes splash and marketing responses
- Clears search banners, hot lists, hints, and trending suggestions
- Rejects dedicated Xiaohongshu advertising media domains
- Supports RedNote `rnote.com` endpoints and compatible `xiaohongshu.com` endpoints
- Removes related-search fields and native music metadata
- Blocks `xhslink.com/o/...` share short links
- Uses conservative ad detection to avoid deleting ordinary shopping notes

## Files

- `RedNote_Remove_Ads.yaml`: Egern remote module
- `rednote_remove_ads.js`: native Egern `ctx` response script

## Notes

The packet capture used for adaptation contains encrypted TLS metadata rather than decrypted response JSON. International response schemas may change between regions and app versions. The script therefore removes only objects with explicit advertising markers.

## Credits

Rule and endpoint research referenced public work from Kelee, RuCu6, and fmz200/wool_scripts. This repository contains an independent Egern-native implementation.
