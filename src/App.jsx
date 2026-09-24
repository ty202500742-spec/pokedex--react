import axios from 'axios'
import { useState, useEffect, useCallback } from 'react'

function App() {
  const [value, setValue] = useState()
  const [pokemon, setPokemon] = useState()
  const [pokemonList, setPokemonList] = useState([])
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selected, setSelected] = useState(null)
  const [description, setDescription] = useState('')
  const limit = 20
  const url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`


  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    setLoading(true)
    axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`).then((response) => {
      const newItems = response.data.results.map((p) => {
        const splitUrl = p.url.split('/')
        const id = splitUrl[splitUrl.length - 2]
        return { name: p.name, id: id }

      })

      setPokemonList((prev) => [...prev, ...newItems])
      setOffset((prev) => prev + limit)
      setHasMore(response.data.next !== null)
      setLoading(false)

    })


  }, [offset, loading, hasMore])

  useEffect(() => {
    loadMore()
  }, [])

  useEffect(() => {
    function handleScroll() {
      const scrollBottom = window.innerHeight + window.scrollY
      const threshold = document.documentElement.scrollHeight - 300
      if (scrollBottom >= threshold) {
        loadMore()
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)

  }, [loadMore])


  function openDetails(id) {
     setDescription('')
    axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`).then((response) => {
       const pokemonData = response.data
    setSelected(pokemonData)

    axios.get(pokemonData.species.url).then((speciesResponse) => {
      const entry = speciesResponse.data.flavor_text_entries.find(
        (e) => e.language.name === 'en'
      )
      setDescription(
        entry
          ? entry.flavor_text.replace(/[\n\f]/g, ' ')
          : 'No description available.'
      )
    })
    })
  }

  function closeDetails() {
    setSelected(null)
  }
  function handleButton() {
    axios.get(url).then((response) => {
      setValue(response.data)
    })
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      handleButton()
    }
  }

  function handleInputChange(event) {
    setPokemon(event.target.value)

  }


  return (
    <div>
      <div className='searchBar'>
        <input type=" text" value={pokemon} placeholder="Pokemon" onChange={handleInputChange} onKeyDown={handleKeyDown} />
        <button onClick={handleButton}>
          fetch pokemon
        </button>
      </div>
      <p className='guide'>Click on a card to see more details</p>
      <div className='searchedCard'>
        {value && (
          <div className='card' onClick={() => openDetails(value.id)}>
            <img className="picture" src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${value?.id}.png`} />
            <div className='withCard'>
              <p>{value?.name}</p>
              <p>ID: {value?.id}</p>
            </div>
          </div>
        )}
      </div>
      <div className='cardList'>
        {pokemonList.map((p) => (
          <div className='card' key={p.id} onClick={() => openDetails(p.id)}>
            <img className="picture" src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`} />
            <div className='withCard'>
              <p>{p.name}</p>
              <p>ID: {p.id}</p>
            </div>
          </div>
        ))}
      </div>
      {loading && <p className='loadingText'>Loading more...</p>}

      {selected && (
        <div className='modalOverlay' onClick={closeDetails} >
          <div className='modal' onClick={(e) => e.stopPropagation()}>
            <button className='closeButton' onClick={closeDetails}>×</button>
            <img className='modalPicture' src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selected.id}.png`} />
            <h2>{selected.name}</h2>
            <p className='description'>{description || 'Loading description...'}</p>
            <p>ID: {selected.id}</p>
            <p>Height: {selected.height}</p>
            <p>Weight: {selected.weight}</p>
            <p>Types: {selected.types.map(t => t.type.name).join(', ')}</p>
            <p>Abilities: {selected.abilities.map(a => a.ability.name).join(', ')}</p>
            <div className='statsList'>
              {selected.stats.map((s) =>
                <div key={s.stat.name} className='statRow'>
                  <span>{s.stat.name}</span>
                  <span>{s.base_stat}</span>

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )

}
export default App