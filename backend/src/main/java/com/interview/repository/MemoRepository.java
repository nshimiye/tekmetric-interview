package com.interview.repository;

import com.interview.model.Memo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MemoRepository extends JpaRepository<Memo, String> {
    List<Memo> findByUserIdAndBookId(String userId, String bookId);
    List<Memo> findByUserId(String userId);
    void deleteByUserIdAndBookId(String userId, String bookId);
}

