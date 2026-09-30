import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CS_IMAGE_MAX_BYTES, checkCsImages } from '../../shared/utils/cs.ts'

test('checkCsImages 只允許 webp／svg，webp 不可超過上限', () => {
	assert.deepEqual(checkCsImages([
		{ name: 'a-thumb.webp', size: CS_IMAGE_MAX_BYTES },
		{ name: 'a-diagram-01.svg', size: CS_IMAGE_MAX_BYTES * 3 },
	]), [])
	const errors = checkCsImages([
		{ name: 'b.png', size: 10 },
		{ name: 'c.webp', size: CS_IMAGE_MAX_BYTES + 1 },
	])
	assert.equal(errors.length, 2)
	assert.match(errors[0], /b\.png/)
	assert.match(errors[1], /c\.webp/)
})

test('shared/utils/cs.ts 不再匯出單元相關函式', async () => {
	const mod = await import('../../shared/utils/cs.ts')
	for (const name of ['validateUnits', 'validateCsDocs', 'groupCsByUnit', 'unitNameOf'])
		assert.equal(name in mod, false, `${name} 應已移除`)
})
