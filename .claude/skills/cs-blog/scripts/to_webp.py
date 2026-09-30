#!/usr/bin/env python3
# 把縮圖或截圖轉成 webp 並壓到 500KB 以內
# 用法：to_webp.py <src> <dst.webp> [--size 1600x900]
# --size：先等比放大／縮小再置中裁切到指定尺寸（縮圖用）；不給則維持原尺寸
import argparse
import io
import sys

from PIL import Image

MAX_BYTES = 500 * 1024


def cover(im, width, height):
	scale = max(width / im.width, height / im.height)
	resized = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
	left = (resized.width - width) // 2
	top = (resized.height - height) // 2
	return resized.crop((left, top, left + width, top + height))


def encode(im, quality):
	buf = io.BytesIO()
	im.save(buf, 'WEBP', quality=quality, method=6)
	return buf.getvalue()


def main():
	parser = argparse.ArgumentParser()
	parser.add_argument('src')
	parser.add_argument('dst')
	parser.add_argument('--size')
	args = parser.parse_args()

	if not args.dst.endswith('.webp'):
		sys.exit('輸出檔名必須是 .webp')

	im = Image.open(args.src)
	im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
	if args.size:
		width, height = (int(v) for v in args.size.lower().split('x'))
		im = cover(im, width, height)

	# 先降品質，仍超標就等比縮小再試
	while True:
		for quality in range(85, 45, -5):
			data = encode(im, quality)
			if len(data) <= MAX_BYTES:
				with open(args.dst, 'wb') as f:
					f.write(data)
				print(f'{args.dst}：{im.width}x{im.height}，quality {quality}，{len(data) / 1024:.0f}KB')
				return
		if args.size or im.width < 400:
			sys.exit(f'無法壓到 500KB 以內（{im.width}x{im.height}，{len(data) / 1024:.0f}KB）')
		im = im.resize((round(im.width * 0.9), round(im.height * 0.9)), Image.LANCZOS)


if __name__ == '__main__':
	main()
