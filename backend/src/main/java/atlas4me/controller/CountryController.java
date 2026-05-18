package atlas4me.controller;

import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import atlas4me.dto.response.CountryResponse;
import atlas4me.service.CountryService;

/**
 * Endpoint público para consulta de países disponíveis na base de conhecimento.
 */
@RestController
@RequestMapping("/api/countries")
@RequiredArgsConstructor
public class CountryController {

    private final CountryService countryService;

    /**
     * Retorna todos os países cadastrados na base de conhecimento.
     *
     * @return lista de {@link CountryResponse} com nome, ISO code e continente de cada país.
     */
    @GetMapping
    public ResponseEntity<List<CountryResponse>> getAllCountries() {
        return ResponseEntity.ok(countryService.getAllCountries());
    }
}