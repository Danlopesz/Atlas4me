package atlas4me.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import atlas4me.dto.response.CountryResponse;
import atlas4me.entity.Country;
import atlas4me.exception.ResourceNotFoundException;
import atlas4me.repository.CountryRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CountryService {

    private final CountryRepository countryRepository;

    public List<CountryResponse> getAllCountries() {
        return countryRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Country getCountryById(Long id) {
        return countryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("País não encontrado: " + id));
    }

    public Country getRandomCountry() {
        return countryRepository.findRandomCountry()
                .orElseThrow(() -> new ResourceNotFoundException("Nenhum país disponível"));
    }

    private CountryResponse toDTO(Country country) {
        return CountryResponse.builder()
                .id(country.getId())
                .namePt(country.getNamePt())
                .isoCode(country.getIsoCode())
                .build();
    }
}
