# PonyTranslator

Allow ponification and deponification of a text or a stream of text. This is a JS (TypeScript) rewrite of [ponypipe](https://github.com/maandree/ponypipe)

## Try it out

```bash
yarn install
yarn tsc
python -m http.server --bind localhost 2019
```

You should see something like the following:

```txt
Serving HTTP on 127.0.0.1 port 2019 (http://127.0.0.1:2019/) ...
```

Then go to `http://localhost:2019/playground.html`.

## Develop

Run in two different terminals:

```bash
yarn tsc --watch
```

```bash
python -m http.server --bind localhost 2019
```

and use the url `http://localhost:2019/playground.html#autoreload`.

It appears the python server is a bit slow to take file changes into account,
which makes the autoreload slow. I might add grunt in the future to solve this.

## License

This code is available under CC0 License (public domain).
