// Import our outputted wasm ES6 module
// Which, export default's, an initialization function

import {AutomataGrafico, Punto} from "./elementos_graficos.js";
import { initSync, build_automata } from "../pkg/automata.js";
import { NFA } from "./nfa.js";

async function fetchWasm() {
	// Instantiate our wasm module
	const response = await fetch("pkg/automata_bg.wasm");
	const buffer = await response.arrayBuffer();
	initSync(buffer);
};

function reshape() {
	let canvas = <HTMLCanvasElement> document.getElementById('canvas');
	canvas.width = canvas.parentElement!.clientWidth;
	canvas.height = canvas.parentElement!.clientHeight;
	let ctx = canvas.getContext("2d")!;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initEventos() {


	////////////////////////////////////////////////
	const container = document.getElementById('main-container')!;
    const center = document.getElementById('center')!;
    const left = document.getElementById('left')!;
	let moving = false;

	document.addEventListener('mouseup', _ => {
		moving = false;
		document.body.style.cursor = 'default';
	});
	center.addEventListener('mousedown', _ => moving = true);

	document.addEventListener('mousemove', e => {
		if(!moving) return;
		let selection = document.getSelection();
		if(selection != null) selection.empty(); //para que no se seleccione el texto cuando nos movemos rápido.
		document.body.style.cursor = 'ew-resize';
		const rec = container.getBoundingClientRect();
        const dx = Math.max(100, e.clientX - rec.x);
        const newLeftWidth = (dx / rec.width) * 100
        left.style.width = newLeftWidth + '%';
		reshape();
		automata.draw();
	});
	////////////////////////////////////////////////


	let canvas = <HTMLCanvasElement> document.getElementById('canvas');
	let ctx = canvas.getContext('2d')!;
	let automata = new AutomataGrafico(canvas, ctx);
	let mouse_in_canvas = false;

	let input = <HTMLInputElement> document.getElementById('input');
	let form = <HTMLFormElement> document.getElementById('form');
	form.addEventListener('submit', e => {
		e.preventDefault();
		let ast = build_automata(input.value);
		console.log('ast: ', ast);
		automata.clear();
		const h = canvas.height;
		new NFA().draw_automata(automata, ast, new Punto(50, h / 2));
		automata.draw();
	});

	canvas.addEventListener('mouseenter', (_) => mouse_in_canvas = true);
	canvas.addEventListener('mouseleave', (_) => mouse_in_canvas = false);
	window.addEventListener('keydown', (e) => automata.cambiar_texto(e.key));
	window.addEventListener('keyup', (e) => { if(e.key == 'Control') automata.control = false });
	window.addEventListener('resize', _ => { reshape(); automata.draw(); });
	window.addEventListener('mousedown', e => {
		if(mouse_in_canvas) automata.create_node_or_link(e);
	});
	window.addEventListener('mousemove', e => {
		if(mouse_in_canvas) automata.movimiento(e);
	});
	window.addEventListener('mouseup', e => {
		if(mouse_in_canvas) automata.mouse_release(e);
	});

	window.setInterval(() => {
		if(automata.elemento_seleccionado != null) {
			automata.draw();
			automata.visibilidad = !automata.visibilidad;
		}
	}, 600)
	canvas.addEventListener('contextmenu', e => {
		e.preventDefault();
	});

}

window.addEventListener('load', initEventos);
window.addEventListener('load', reshape);
window.addEventListener('load', fetchWasm);
