import React, { useState } from 'react';

function GameList({ image, name, description, gameId, onDelete, customDescription, onDescriptionChange, onSave, isSaved }) {
  // Função para tratar a imagem, verificando se a URL é válida
  const handleImage = (image) => {
    // Verificando se a URL de imagem é válida
    return image && image.startsWith('http') ? image : 'https://via.placeholder.com/150'; // Imagem padrão caso a URL não seja válida
  };

  return (
    <div className="card h-100">
      <img 
        src={handleImage(image)} // Passando a imagem tratada
        className="card-img-top" 
        alt={name} 
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{name}</h5>

        {/* Campo editável de descrição */}
        {!isSaved ? (
          <>
            <textarea
              className="form-control mb-2"
              value={customDescription}
              placeholder="Digite uma descrição personalizada"
              onChange={(e) => onDescriptionChange(e.target.value)} // Chama a função para atualizar a descrição
            />
            <button className="btn btn-primary mb-2" onClick={onSave}>
              Salvar
            </button>
          </>
        ) : (
          <p className="card-text">{customDescription || description || "Descrição não disponível"}</p>
        )}

        {/* Botão para deletar o jogo */}
        <button className="btn btn-danger mt-auto" onClick={() => onDelete(gameId)}>
          Deletar
        </button>
      </div>
    </div>
  );
}

export default GameList;
