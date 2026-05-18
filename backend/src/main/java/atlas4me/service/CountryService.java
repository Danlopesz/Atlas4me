package atlas4me.service;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import atlas4me.dto.response.CountryResponse;
import atlas4me.entity.Country;
import atlas4me.exception.ResourceNotFoundException;
import atlas4me.repository.CountryRepository;

/**
 * Serviço de consulta de países disponíveis na base de conhecimento.
 */
@Service
@RequiredArgsConstructor
public class CountryService {

    private final CountryRepository countryRepository;

    /**
     * Retorna todos os países cadastrados, ordenados alfabeticamente pelo nome em português.
     *
     * @return lista de {@link CountryResponse} com todos os campos do país.
     */
    public List<CountryResponse> getAllCountries() {
        return countryRepository.findAllByOrderByNamePtAsc().stream()
                .map(this::toCountryResponse)
                .collect(Collectors.toList());
    }

    /**
     * Busca um país pelo seu ID.
     *
     * @param id identificador do país.
     * @return entidade {@link Country} correspondente.
     * @throws ResourceNotFoundException se o país não existir.
     */
    public Country getCountryById(Long id) {
        return countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("País não encontrado: " + id));
    }

    /**
     * Retorna um país aleatório da base de conhecimento.
     *
     * @return entidade {@link Country} sorteada aleatoriamente.
     * @throws ResourceNotFoundException se não houver países disponíveis.
     */
    public Country getRandomCountry() {
        return countryRepository.findRandomCountry()
                .orElseThrow(() -> new ResourceNotFoundException("Nenhum país disponível"));
    }

    private CountryResponse toCountryResponse(Country country) {
        return CountryResponse.builder()
                .id(country.getId())
                .namePt(country.getNamePt())
                .nameEn(country.getNameEn())
                .isoCode(country.getIsoCode())
                .continent(country.getContinent())
                .subContinent(country.getSubContinent())
                .capital(country.getCapital())
                .flagUrl(country.getFlagUrl())
                .latitude(country.getLatitude())
                .longitude(country.getLongitude())
                .build();
    }
}