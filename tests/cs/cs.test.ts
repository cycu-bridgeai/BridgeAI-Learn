import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
	CS_IMAGE_MAX_BYTES,
	checkCsImages,
	groupCsByUnit,
	unitNameOf,
	validateCsDocs,
	validateUnits,
} from '../../shared/utils/cs.ts'
import type { CsUnit } from '../../shared/utils/cs.ts'

const units: CsUnit[] = [
	{ id: 'io', name: '輸入與輸出', order: 4 },
	{ id: 'env-setup', name: '環境建立', order: 1 },
	{ id: 'ipo', name: '邏輯先行與 IPO', order: 5 },
]

test('validateUnits 接受合法清單', () => {
	assert.deepEqual(validateUnits(units), [])
})

test('validateUnits 擋非陣列、缺欄位、重複 id 與 order', () => {
	assert.equal(validateUnits(undefined).length, 1)
	assert.match(validateUnits([{ id: 'io', name: '輸入與輸出' }])[0], /order/)
	assert.match(validateUnits([...units, { id: 'io', name: 'x', order: 9 }]).join(), /重複的 id：io/)
	assert.match(validateUnits([...units, { id: 'new', name: 'x', order: 4 }]).join(), /重複的 order：4/)
})

test('validateCsDocs 擋不在清單內或缺少的 unit', () => {
	assert.deepEqual(validateCsDocs(units, [{ file: 'a.md', unit: 'io' }]), [])
	const errors = validateCsDocs(units, [{ file: 'b.md', unit: 'nope' }, { file: 'c.md' }])
	assert.equal(errors.length, 2)
	assert.match(errors[0], /b\.md.*nope/)
	assert.match(errors[1], /c\.md.*缺少 unit/)
})

test('groupCsByUnit 依 order 分組、組內新到舊、略過空單元', () => {
	const docs = [
		{ unit: 'io', date: '2026-10-01', title: 'io-old' },
		{ unit: 'env-setup', date: '2026-10-05', title: 'env' },
		{ unit: 'io', date: '2026-10-08', title: 'io-new' },
	]
	const groups = groupCsByUnit(units, docs)
	assert.deepEqual(groups.map(g => g.unit.id), ['env-setup', 'io'])
	assert.deepEqual(groups[1].posts.map(p => p.title), ['io-new', 'io-old'])
})

test('groupCsByUnit 不改原陣列', () => {
	const docs = [{ unit: 'io', date: '2026-01-01' }, { unit: 'io', date: '2026-02-01' }]
	groupCsByUnit(units, docs)
	assert.deepEqual(docs.map(d => d.date), ['2026-01-01', '2026-02-01'])
})

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

test('unitNameOf 找不到回傳 undefined', () => {
	assert.equal(unitNameOf(units, 'io'), '輸入與輸出')
	assert.equal(unitNameOf(units, 'x'), undefined)
})
