const expect = require('chai').expect
const unpad = (s) => s.replace(/[ ]+/g, '').replace(/^\n/, '')

const fov = require('../fov.js')

function run(shape, size, opaqueApply, map) {
    var w = map[0].length
    var h = map.length
    map = map.map(row => row.split(''))
    var py = map.findIndex(row => row.indexOf('@') !== -1)
    var px = map[py].indexOf('@')
    var fov_settings = {
        shape: 'circle',
        opaque: (map, x, y) => {
            return y < 0 || y >= h || x < 0 || x >= w || map[y][x] === '#'
        },
        apply: (map, x, y, sx, sy) => {
            if (x >= 0 && x < w && y >= 0 && y < h) {
                map[y][x] = 'x'
            }
        },
        opaque_apply: opaqueApply,
    }
    fov[shape](fov_settings, map, px, py, size);
    map = map.map(row => row.join('')).join("\n")
    return map
}

describe('fov', () => {
    describe('#circle()', () => {
        it('should be the right shape', () => {
            expect(run('circle', 7, true, [
                '......................',
                '......................',
                '......................',
                '......................',
                '......................',
                '......................',
                '...........@..........',
                '......................',
                '......................',
                '......................',
                '......................',
                '......................',
                '......................',
            ])).to.equal([
                '........xxxxxxx.......',
                '.......xxxxxxxxx......',
                '......xxxxxxxxxxx.....',
                '.....xxxxxxxxxxxxx....',
                '.....xxxxxxxxxxxxx....',
                '.....xxxxxxxxxxxxx....',
                '.....xxxxxx@xxxxxx....',
                '.....xxxxxxxxxxxxx....',
                '.....xxxxxxxxxxxxx....',
                '.....xxxxxxxxxxxxx....',
                '......xxxxxxxxxxx.....',
                '.......xxxxxxxxx......',
                '........xxxxxxx.......',
            ].join("\n"))
        })

        it('should call apply on the walls', () => {
            expect(run('circle', 7, true, [
                '...............',
                '...............',
                '...............',
                '...............',
                '...............',
                '@#.............',
            ])).to.equal([
                'xxxxx..........',
                'xxxxxx.........',
                'xxxxxxx........',
                'xxxxxxx........',
                'xxxxxxx........',
                '@x.............',
            ].join("\n"))
        })

        it('should allow a corner peak setting', () => {
            expect(run('circle', 7, false, [
                '...............',
                '...............',
                '...............',
                '...............',
                '...............',
                '@#.............',
            ])).to.equal([
                'xxxxx..........',
                'xxxxx..........',
                'xxxx...........',
                'xxx............',
                'xx.............',
                '@#.............',
            ].join("\n"))
        })

        it('should light low angle walls', () => {
            expect(run('circle', 40, true, [
                '............................',
                '............................',
                '............................',
                '............................',
                '@...........................',
                '.###########################',
            ])).to.equal([
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                '@xxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            ].join("\n"))
        })

        it('should block light reaching a wall behind', () => {
            expect(run('circle', 40, true, [
                '############################',
                '............................',
                '............................',
                '..#.........................',
                '@...........................',
                '............................',
            ])).to.equal([
                'xxxxx#############xxxxxxxxxx',
                'xxxx.........xxxxxxxxxxxxxxx',
                'xxx.....xxxxxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                '@xxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            ].join("\n"))
        })

        it('should work with alternating walls and spaces', () => {
            expect(run('circle', 40, true, [
                '############################',
                '............................',
                '............................',
                '#.#.#.#.#.#.#.#.#.#.#.#.#.#.',
                '............................',
                '............@...............',
            ])).to.equal([
                '########xxxx##xxx###########',
                '.........xxx.xxx............',
                '..........xx.xx.............',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                'xxxxxxxxxxxx@xxxxxxxxxxxxxxx',
            ].join("\n"))
        })

    })
})
