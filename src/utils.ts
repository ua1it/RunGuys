export const W = 'w'
export const A = 'a'
export const S = 's'
export const D = 'd'
export const N = 'n'
export const SPACE = ' ' // means spacebar
export const SPACE_VISIBLE = 'space'
export const SHIFT = 'shift'
export const DIRECTIONS = [W, A, S, D]

export class KeyDisplay {

    map: Map<string, HTMLDivElement> = new Map()

    constructor() {
        const w: HTMLDivElement = document.createElement("div")
        const a: HTMLDivElement = document.createElement("div")
        const s: HTMLDivElement = document.createElement("div")
        const d: HTMLDivElement = document.createElement("div")
        const shift: HTMLDivElement = document.createElement("div")
        const space: HTMLDivElement = document.createElement("div")
        const space_visible: HTMLDivElement = document.createElement("div")
        const n: HTMLDivElement = document.createElement("div")

        this.map.set(W, w)
        this.map.set(A, a)
        this.map.set(S, s)
        this.map.set(D, d)
        this.map.set(SHIFT, shift)
        this.map.set(SPACE, space)
        this.map.set(SPACE_VISIBLE, space_visible)
        this.map.set(N, n)

        this.map.forEach( (v, k) => {
            v.style.color = 'blue'
            v.style.fontSize = '50px'
            v.style.fontWeight = '800'
            v.style.position = 'absolute'
            v.textContent = k
        })

        this.updatePosition()

        this.map.forEach( (v, _) => {
            document.body.append(v)
        })
    }

    public updatePosition() {
        this.map.get(W).style.top = `${window.innerHeight - 150}px`
        this.map.get(A).style.top = `${window.innerHeight - 100}px`
        this.map.get(S).style.top = `${window.innerHeight - 100}px`
        this.map.get(D).style.top = `${window.innerHeight - 100}px`
        this.map.get(SHIFT).style.top = `${window.innerHeight - 100}px`
        // this.map.get(SPACE).style.top = `${window.innerHeight - 150}px`
        this.map.get(SPACE_VISIBLE).style.top = `${window.innerHeight - 150}px`
        this.map.get(N).style.top = `${window.innerHeight-200}px`

        this.map.get(W).style.left = `${300}px`
        this.map.get(A).style.left = `${200}px`
        this.map.get(S).style.left = `${300}px`
        this.map.get(D).style.left = `${400}px`
        this.map.get(SHIFT).style.left = `${50}px`
        // this.map.get(SPACE).style.left = `${50}px`
        this.map.get(SPACE_VISIBLE).style.left = `${50}px`
        this.map.get(N).style.left = `${50}px`
    }

    public down (key: string) {
        if (this.map.get(key.toLowerCase())) {
            
            // spacebar
            if(this.map.get(key.toLowerCase()).textContent == ' '){
                this.map.get(SPACE_VISIBLE).style.color = 'red'
            }

            // other keys
            this.map.get(key.toLowerCase()).style.color = 'red'
        }
    }

    public up (key: string) {
        if (this.map.get(key.toLowerCase())) {

            // spacebar
            if(this.map.get(key.toLowerCase()).textContent == ' '){
                this.map.get(SPACE_VISIBLE).style.color = 'blue'
            }

            //other keys
            this.map.get(key.toLowerCase()).style.color = 'blue'
        }
    }

}