export function test_connection(url) {
    let project_version = 2; // Versão inicial do projeto
    console.log(`Versão do projeto: ${project_version}`);

    const random_number = Math.floor(Math.random() * 1000); // Gera um número aleatório entre 0 e 999
    const user_name = `test-${random_number}`; // Nome do usuário
    const test_socket = io(url, {
      query: {
        room: 'test-room',
        user: user_name,
        room_name: 'Test Room',
        card_date: new Date().toISOString()
      },
      transports: ["websocket"],
      reconnection: false,
      timeout: 5000
    });
  
    // Armazenará as conexões RTCPeerConnection indexadas por peer id
    const peer_connections = {};
    // Configurações para o RTCPeerConnection (STUN)
    const pc_config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };
  
    let local_stream = null;
    let is_local_stream_ready = false;
    // Conjunto para armazenar IDs que chegarem via "call" antes de o stream estar pronto
    const pending_peers = new Set();
  
    // Função para criar a conexão RTCPeerConnection e configurar os eventos
    function create_peer_connection(peer_id) {
      const pc = new RTCPeerConnection(pc_config);
  
      // Adiciona as tracks do stream local (se disponível)
      if (local_stream) {
        local_stream.getTracks().forEach(track => {
          pc.addTrack(track, local_stream);
        });
      }
  
      // Quando receber uma track remota, cria (ou atualiza) o elemento de vídeo correspondente
      pc.ontrack = (event) => {
        let remote_video = document.getElementById(`video_${peer_id}`);
        if (!remote_video) {
          remote_video = document.createElement('video');
          remote_video.id = `video_${peer_id}`;
          remote_video.autoplay = true;
          remote_video.playsinline = true;
          const container = document.querySelector('dialog[type="supacall"]>container');
          if (container) {
            container.appendChild(remote_video);
          }
        }
        remote_video.srcObject = event.streams[0];
      };
  
      // Quando houver um ICE candidate, envia para o peer correspondente
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          test_socket.emit('candidate', { id: peer_id, candidate: event.candidate });
        }
      };
  
      return pc;
    }
  
    // Inicializa o stream local e cria o próprio elemento de vídeo
    async function init_local_stream() {
      try {
        local_stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const local_video = document.createElement('video');
        local_video.id = `video_${test_socket.id}`;
        local_video.srcObject = local_stream;
        local_video.autoplay = true;
        local_video.muted = true; // Para evitar eco
        const container = document.querySelector('dialog[type="supacall"] container');
        if (container) {
          container.appendChild(local_video);
        }
        is_local_stream_ready = true;
        // Para os peers que chegaram enquanto o stream não estava pronto
        pending_peers.forEach(peer_id => {
          initiate_connection(peer_id);
        });
        pending_peers.clear();
      } catch (err) {
        console.error('Erro ao acessar a webcam:', err);
      }
    }
  
    // Função que inicia a conexão com um peer específico
    async function initiate_connection(peer_id) {
      if (peer_connections[peer_id]) return;
      const pc = create_peer_connection(peer_id);
      peer_connections[peer_id] = pc;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        test_socket.emit('offer', { id: peer_id, offer: pc.localDescription });
      } catch (err) {
        console.error('Erro ao criar oferta:', err);
      }
    }
  
    // Ao conectar, inicializa o stream local
    test_socket.on('connect', async () => {
      console.log(`Conectado ao servidor ${url}`);
      await init_local_stream();
    });
  
    // Evento "call": disparado quando alguém entra na sala.
    test_socket.on('call', (data) => {
      if (data.id === test_socket.id) return;
      if (!is_local_stream_ready) {
        pending_peers.add(data.id);
      } else {
        initiate_connection(data.id);
      }
    });
  
    // Ao receber uma oferta, responde com uma answer
    test_socket.on('offer', async (data) => {
      const peer_id = data.id;

      let pc = peer_connections[peer_id];
      if (!pc) {
        pc = create_peer_connection(peer_id);
        peer_connections[peer_id] = pc;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        test_socket.emit('answer', { id: peer_id, answer: pc.localDescription });
      } catch (err) {
        console.error('Erro ao processar a oferta:', err);
      }
    });
  
    // Ao receber uma answer à oferta enviada
    test_socket.on('answer', async (data) => {
      const peer_id = data.id;
      const pc = peer_connections[peer_id];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } catch (err) {
          console.error('Erro ao setar descrição remota:', err);
        }
      }
    });
  
    // Ao receber um candidato ICE
    test_socket.on('candidate', async (data) => {
      const peer_id = data.id;
      const pc = peer_connections[peer_id];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('Erro ao adicionar candidato ICE:', err);
        }
      }
    });
  
    // Remove o vídeo e a conexão quando um usuário se desconectar
    test_socket.on('disconnect-user', (data) => {
      const video_element = document.getElementById(`video_${data.id}`);
      if (video_element) {
        video_element.srcObject = null;
        video_element.remove();
      }
      if (peer_connections[data.id]) {
        peer_connections[data.id].close();
        delete peer_connections[data.id];
      }
    });
  
    test_socket.on('connect_error', function (error) {
      console.error(`Erro ao conectar a ${url}:`, error);
      test_socket.disconnect();
    });
  
    test_socket.on('user-list', (users) => {
      console.log('\x1b[36mUsuários na sala:\x1b[0m');
      users.forEach(user => {
        console.log(`\x1b[36m- ${user.userName}\x1b[0m`);
      });
    });
  
    test_socket.on('user-connected', (data) => {
      console.log(`\x1b[33m${data.userName} entrou na sala\x1b[0m`);
    });
  
    test_socket.on('disconnect-user', (data) => {
      console.log(`\x1b[31m${data.data.user} saiu da sala\x1b[0m`);
    });

    // Função para atualizar a versão do projeto
    function update_version() {
      project_version += 1;
      console.log(`Versão do projeto atualizada: ${project_version}`);
    }

    // Exemplo de como chamar a função para atualizar a versão
    // update_version();
}
  