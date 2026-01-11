package atlas4me.repository;

import atlas4me.entity.Country;
import atlas4me.entity.CountryFeature;
import atlas4me.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CountryFeatureRepository extends JpaRepository<CountryFeature, Long> {
    
    // Seu método antigo (pode manter)
    Optional<CountryFeature> findByCountryAndQuestion(Country country, Question question);

    // --- NOVO MÉTODO OTIMIZADO ---
    // Busca todas as features de uma LISTA de países e uma LISTA de perguntas
    List<CountryFeature> findByCountryInAndQuestionIn(Collection<Country> countries, Collection<Question> questions);

    List<CountryFeature> findByQuestion(Question question);
}