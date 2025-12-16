package atlas4me.repository;

import atlas4me.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    // Padrão do JPA, não precisa de métodos extras por enquanto
}