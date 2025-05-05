import React, { useState, useEffect } from 'react';
import axios from 'axios';
import debounce from 'lodash.debounce';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import Header from './components/Header';
import GameList from './components/GameList';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [previewGames, setPreviewGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGames = (searchQuery) => {
    if (!searchQuery.trim()) {
      setPreviewGames([]);
      return;
    }

    setLoading(true);
    axios
      .get(`https://api.rawg.io/api/games?key=935f87aa7bea4c27ba2ec9c54b03f2bc&page=${page}&page_size=5&search=${searchQuery}`)
      .then((response) => {
        const newGames = response.data.results;
        setPreviewGames(newGames);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Erro ao buscar jogos:', error);
        setLoading(false);
      });
  };

  const addGameToCatalog = (game) => {
    if (!games.some((g) => g.id === game.id)) {
      setGames((prevGames) => [
        ...prevGames,
        {
          ...game,
          rating: 0,
          customDescription: "",
          isSavedToBackend: false
        }
      ]);
      setPreviewGames([]);
      setSearchQuery('');
    }
  };

  const deleteGame = (gameId) => {
    setGames(games.filter((game) => game.id !== gameId));
  };

  const handleRateGame = (gameId, rating) => {
    setGames(games.map(game => game.id === gameId ? { ...game, rating } : game));
  };

  const handleDescriptionChange = (gameId, newDescription) => {
    setGames(games.map(game => game.id === gameId ? { ...game, customDescription: newDescription } : game));
  };

  const handleSave = (gameId, newDescription, newRating) => {
    const game = games.find((g) => g.id === gameId);
    if (!game) return;

    const transformedRating = newRating; // Não é necessário arredondar, já está multiplicado por 2

    if (!game.isSavedToBackend) {
      axios.post('http://localhost:8080/Game/criar', {
        name: game.name,
        description: newDescription,
        rating: transformedRating,
        image: game.background_image || 'https://via.placeholder.com/300x200'
      })
      .then((response) => {
        console.log('Jogo criado com sucesso!', response.data);
        setGames(games.map(g =>
          g.id === gameId ? {
            ...g,
            isSavedToBackend: true,
            customDescription: newDescription,
            rating: transformedRating
          } : g
        ));
      })
      .catch((error) => {
        console.error('Erro ao criar o jogo:', error);
      });
    } else {
      axios.put(`http://localhost:8080/Game/atualizar/${gameId}`, {
        description: newDescription,
        rating: transformedRating
      })
      .then(() => {
        console.log('Jogo atualizado com sucesso!');
        setGames(games.map(g =>
          g.id === gameId ? {
            ...g,
            customDescription: newDescription,
            rating: transformedRating
          } : g
        ));
      })
      .catch((error) => {
        console.error('Erro ao atualizar o jogo:', error);
      });
    }
  };

  const debouncedFetchGames = debounce((query) => fetchGames(query), 500);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    debouncedFetchGames(query);
  };

  const goToNextPage = () => setPage((prevPage) => prevPage + 1);
  const goToPreviousPage = () => setPage((prevPage) => Math.max(prevPage - 1, 1));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGames(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, page]);

  return (
    <div>
      <Header onSearch={handleSearchChange} />

      {searchQuery.trim() !== '' && previewGames.length > 0 && (
        <div className="preview-container w-100 px-3 px-sm-4 py-3">
          <div className="row">
            {previewGames.map((game) => (
              <div
                className="col-12 col-md-4 mb-4"
                key={game.id}
                onClick={() => addGameToCatalog(game)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card preview-card h-100">
                  <img
                    src={game.background_image || 'https://via.placeholder.com/300x200'}
                    className="card-img-top"
                    alt={game.name}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{game.name}</h5>
                    <p className="card-text" style={{ fontSize: '0.9rem' }}>
                      Clique para adicionar ao catálogo.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-between mt-3">
            <button
              className="btn custom-btn"
              onClick={goToPreviousPage}
              disabled={page === 1}
            >
              Anterior
            </button>
            <button
              className="btn custom-btn"
              onClick={goToNextPage}
            >
              Próximo
            </button>
          </div>
        </div>
      )}

      <main>
        <div className="container mt-4">
          {loading ? (
            <div className="loading-spinner-container">
              <div className="spinner-border" role="status" />
            </div>
          ) : (
            <div className="row">
              {games.map((game) => (
                <div className="col-md-4" key={game.id}>
                  <GameList
                    gameId={game.id}
                    image={game.background_image}
                    name={game.name}
                    description={game.description}
                    customDescription={game.customDescription}
                    rating={game.rating}
                    onDelete={deleteGame}
                    onSave={handleSave}
                    onDescriptionChange={handleDescriptionChange}
                    onRate={handleRateGame}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
