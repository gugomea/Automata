// Import our outputted wasm ES6 module
// Which, export default's, an initialization function

import {TransicionGrafica, AutomataGrafico, NodoGrafico, Punto } from "./elementos_graficos.js";
import { initSync, build_automata } from "../pkg/automata.js";

async function fetchWasm() {
	// Instantiate our wasm module
	const response = await fetch("./pkg/automata_bg.wasm");
	const buffer = await response.arrayBuffer();
	initSync(buffer);
};

function reshape() {
	let canvas = <HTMLCanvasElement> document.getElementById('canvas');
	canvas.width = (window.innerWidth / 9) * 8;
	canvas.height = (window.innerHeight / 9) * 8;
	let ctx = canvas.getContext("2d")!;
	//ctx.fillStyle = 'white';
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function initEventos() {

	let canvas = <HTMLCanvasElement> document.getElementById('canvas');
	let ctx = canvas.getContext('2d')!;
	let automata = new AutomataGrafico(canvas, ctx);
	let mouse_in_canvas = false;

	let input = <HTMLInputElement> document.getElementById('input');
	let form = <HTMLFormElement> document.getElementById('form');
	form.addEventListener('submit', e => {
		e.preventDefault();
		//console.log(build_automata(input.value));
		let nodo_1 = new NodoGrafico(0, new Punto(100, 100)); 
		let nodo_2 = new NodoGrafico(1, new Punto(200, 200));
		let transicion = new TransicionGrafica(nodo_1, nodo_2);
		automata.nodos.push(nodo_1);
		automata.nodos.push(nodo_2);
		automata.transiciones.push(transicion);
	});


	canvas.addEventListener('mouseenter', (_) => mouse_in_canvas = true);
	canvas.addEventListener('mouseleave', (_) => mouse_in_canvas = false);
	window.addEventListener('keydown', (e) => automata.cambiar_texto(e.key));
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
