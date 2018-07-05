const codes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
const pieces = {
    'I': [[0, -1], [0, 0], [0, 1], [0, 2]],
    'O': [[0, 0], [0, 1], [1, 0], [1, 1]],
    'T': [[0, -1], [0, 0], [0, 1], [1, 0]],
    'S': [[0, -1], [0, 0], [1, 0], [1, 1]],
    'Z': [[0, 0], [0, 1], [1, -1], [1, 0]],
    'J': [[0, -1], [0, 0], [0, 1], [1, -1]],
    'L': [[0, -1], [0, 0], [0, 1], [1, 1]],
};

function rotation([x, y], radian) {
  let cos = Math.cos(radian);
  let sin = Math.sin(radian);
  let rx = x * cos - y * sin;
  let ry = x * sin + y * cos;
  return [Math.round(rx), Math.round(ry)];
}

function rotate(piece, radian) {
  let newPiece = new Array(4);
  for (let i = 0; i < 4; i++) {
    newPiece[i] = rotation(piece[i], radian);
  }
  return newPiece;
}

function rotateLeft(piece) {
  return rotate(piece, Math.PI/2);
}

function rotateRight(piece) {
  return rotate(piece, -Math.PI/2);
}

let vm = new Vue({
  el: '#app',

  data: {
    height: 22,
    width: 10,
    control: '',
    filled: [],
    piece: pieces['T'],
    position: [20, 5],
    counter: 0,
    speed: 5,
    lines: 0,
    level: 1,
    intervalID: null,
  },
  
  created: function() {
    window.addEventListener("keydown", this.handler);
    this.intervalID = window.setInterval(this.dynamics, 100);
    this.filled = new Array(this.height);
    for (let i = 0; i < this.height; i++) {
      this.filled[i] = new Array(this.width);
      for (let j = 0; j < this.width; j++) {
        this.filled[i][j] = false;
      }
    }
    for (let j = 0; j < this.width; j++) {
      this.filled[0][j] = true;
    }
  },
  
  destroyed: function() {
    window.clearInterval(this.intervalID);
  },
  
  computed: {
    info: function() {
      return {
        Lines: this.lines,
      };
    },
  },

  methods: {

    square: function(i, pos) {
      let y = pos[0] + this.piece[i][0];
      let x = pos[1] + this.piece[i][1];
      return [y, x];
    },

    outOfBounds: function(y, x) {
      let yOut = y < 0 || y >= this.height;
      let xOut = x < 0 || x >= this.width;
      return yOut || xOut;
    },

    occlusion: function() {
      let grid = JSON.parse(JSON.stringify(this.filled));
      for (let i = 0; i < 4; i++) {
        let [y, x] = this.square(i, this.position);
        grid[y][x] = true;
      }
      return grid;
    },
    
    overlap: function(pos) {
      for (let i = 0; i < 4; i++) {
        let [y, x] = this.square(i, pos);
        if (this.outOfBounds(y, x) || this.filled[y][x]) return true;
      }
      return false;
    },

    drop: function() {
      let [y, x] = this.position;
      if (this.overlap([y-1, x])) {
        this.filled = this.occlusion();
        this.clear();
        this.newPiece();
      } else {
        let [y, x] = this.position;
        this.position = [y-1, x];
      }
    },

    clear: function() {
      let full = new Array(this.height);
      full[0] = false;
      for (let i = 1; i < this.height; i++) {
        full[i] = true;
        for (let j = 0; j < this.width; j++) {
          if (!this.filled[i][j]) {
            full[i] = false;
            break;
          }
        }
        if (full[i]) {
          this.lines++;
        }
      }
      let grid = new Array(this.height);
      for (let i = 0, k = 0; i < this.height; i++, k++) {
        grid[i] = new Array(this.width);
        while (full[k]) {
          k++;
        }
        for (let j = 0; j < this.width; j++) {
          grid[i][j] = k < this.height ? this.filled[k][j] : false;
        }
      }
      this.filled = grid;
    },

    newPiece: function() {
      let rand = Math.floor(Math.random() * 7);
      this.piece = pieces[codes[rand]];
      this.position = [20, 5];
    },

    dynamics: function() {
      this.counter++;
      if (this.counter > this.speed) {
        this.counter = 0;
        this.drop();
      }
    },
    
    handler: function(event) {
      let [y, x] = this.position;
      switch (event.key) {
        case 'j':
          this.piece = rotateLeft(this.piece);
          break;
        case 'k':
          this.piece = rotateRight(this.piece); 
          break;
        case 's':
          if (!this.overlap([y, x-1])) {
            this.position = [y, x-1]; 
          }
          break;
        case 'f':
          if (!this.overlap([y, x+1])) {
            this.position = [y, x+1];
          }
          break;
        case 'd':
          this.drop();
          break;
        case 'q':
          window.clearInterval(this.intervalID);
          break;
      }
    },
  },
});
